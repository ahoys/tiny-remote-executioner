import { resolve } from "node:path";
import { FILES_DIR, log } from "../index";

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
