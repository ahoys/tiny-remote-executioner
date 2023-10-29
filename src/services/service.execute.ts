import { resolve } from "node:path";
import {
  ALLOWED_EXTENSIONS,
  MAX_FILESIZE_IN_KB,
  MAX_FILES_IN_REQUEST,
  log,
} from "../index";
import { exec } from "node:child_process";
import { access, constants } from "node:fs";
import { saveFileToDisk } from "../utilities/utilities.files";
import { createResponse } from "../utilities/utilities.responses";
import {
  getArgsErrors,
  getFileErrors,
  getScriptErrors,
} from "../utilities/utilities.validation";

/**
 * Will safely execute the given script with the given arguments.
 * The script must be located in the scripts folder and it must be executable.
 * @param {Request} req The request.
 */
export const execute = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    const { script, args } = body;
    // Validate arguments.
    if (typeof script !== "string" || (args && !Array.isArray(args))) {
      return new Response(null, { status: 400 });
    }
    // Find the script file.
    const scriptFile = resolve("./scripts", script);
    const fileExists = await Bun.file(scriptFile).exists();
    if (!fileExists) return new Response(null, { status: 404 });
    access(scriptFile, constants.X_OK, (err) => {
      if (err) {
        log(`The file ${scriptFile} cannot be executed. No permission.`);
        return new Response(null, { status: 403 });
      }
    });
    // Run the sh-script and return response.
    const result: Response = await new Promise((resolve, reject) => {
      exec(
        `${scriptFile} ${(args || []).join(" ")}`,
        (error, stdout, stderr) => {
          if (error || stderr) {
            log(error || stderr);
            reject(new Response(null, { status: 500 }));
          }
          resolve(new Response(stdout, { status: 200 }));
        }
      );
    });
    return result;
  } catch (error) {
    log(error);
    return new Response(null, { status: 500 });
  }
};

export const executeFormData = async (req: Request): Promise<Response> => {
  try {
    const formData = await req.formData();
    // Validate the script.
    const script = formData.get("script");
    const scriptValidationError = await getScriptErrors(script);
    if (scriptValidationError) {
      return createResponse({
        error: scriptValidationError,
        status: 400,
      });
    }
    // Validate the args.
    const args = formData.getAll("args");
    const argsValidationError = getArgsErrors(args);
    if (argsValidationError) {
      return createResponse({
        error: argsValidationError,
        status: 400,
      });
    }
    // Validate the files.
    const files = formData.getAll("files");
    const fileValidationError = getFileErrors(files);
    if (fileValidationError) {
      return createResponse({
        error: fileValidationError,
        status: 400,
      });
    }
    // Save files.
    const filePromises: Promise<{ name: string; size: number }>[] = [];
    for (const file of files) {
      if (file instanceof File) {
        filePromises.push(saveFileToDisk(file));
      }
    }
    const savedFiles = await Promise.all(filePromises);
    const savedFilesWithErrors = savedFiles
      .filter((f) => f.size === 0)
      .map((f) => f.name);
    if (savedFilesWithErrors.length) {
      return createResponse({
        error: "Could not save files: " + savedFilesWithErrors.join(", "),
        status: 500,
      });
    }
    // const numbers = filePromises as number[];
    // const combinedSize = (filePromises as number[]).reduce((a, b) => a + b, 0);
    return new Response(null, { status: 200 });
  } catch (error) {
    log(error);
    return new Response(null, { status: 500 });
  }
};
