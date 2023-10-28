import { resolve } from "node:path";
import { log } from "../index";
import { exec } from "node:child_process";
import { access, constants } from "node:fs";

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
