import { resolve } from "node:path";
import { exec } from "node:child_process";
import { createFilesDir, saveFileToDisk } from "../utilities/utilities.files";
import { ITreResponse, createResponse } from "../utilities/utilities.responses";
import {
  getArgsErrors,
  getFileErrors,
  getScriptErrors,
} from "../utilities/utilities.validation";
import { log } from "../utilities/utilities.logging";

/**
 * Will safely execute the given script with the given arguments.
 * The script must be located in the scripts folder and it must be executable.
 * @param {Request} req The request.
 */
export const execute = async (req: Request): Promise<Response> => {
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
    const fileValidationError = await getFileErrors(files);
    if (fileValidationError) {
      return createResponse({
        error: fileValidationError,
        status: 400,
      });
    }
    // Make sure files directory exists.
    await createFilesDir();
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
    // Find the script file.
    const scriptFile = resolve("./scripts", script?.toString() || "");
    const fileExists = await Bun.file(scriptFile).exists();
    if (!fileExists)
      return createResponse({
        error: "The script " + scriptFile + " does not exist.",
        status: 400,
      });
    // Run the sh-script and return result.
    const result = await new Promise<ITreResponse>(
      (
        resolve: (value: ITreResponse) => void,
        reject: (reason: ITreResponse) => void
      ) => {
        exec(
          `${scriptFile} ${(args || []).join(" ")}`,
          (error, stdout, stderr) => {
            if (error || stderr) {
              return reject({
                error:
                  "Failed to run the script. " +
                  "Make sure the permissions are correct.",
                stdout,
                stderr,
                status: 500,
              });
            } else {
              return resolve({
                stdout,
                status: 200,
              });
            }
          }
        );
      }
    );
    return createResponse(result);
  } catch (error) {
    log(error);
    return createResponse({
      error:
        typeof (error as ITreResponse)?.error === "string"
          ? (error as ITreResponse).error
          : "",
      status: 500,
    });
  }
};
