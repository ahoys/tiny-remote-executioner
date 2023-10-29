import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { FILES_DIR } from "../index";
import { log } from "./utilities.logging";

/**
 * Creates the files directory if it doesn't exist.
 */
export const createFilesDir = async (): Promise<void> => {
  try {
    // Create files directory.
    if (existsSync(FILES_DIR) === false) {
      log("Creating the files directory " + FILES_DIR + ".");
      mkdirSync(FILES_DIR, { recursive: true });
    }
  } catch (error) {
    log(error);
  }
};

/**
 * Saves the given file to disk.
 * @param file The file to save.
 * @returns {Promise<number>} Bytes written to disk.
 */
export const saveFileToDisk = async (
  file: File
): Promise<{ name: string; size: number }> => {
  try {
    return {
      name: file.name,
      size: await Bun.write(resolve(FILES_DIR, file.name), file),
    };
  } catch (error) {
    log(error);
    return {
      name: file?.name || "unknown",
      size: 0,
    };
  }
};
