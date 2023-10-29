import { fileTypeFromBlob } from "file-type";
import { resolve } from "node:path";
import {
  FILES_EXTENSIONS,
  FILES_MAX_SIZE_IN_KB,
  FILES_MAX_COUNT,
} from "../index";
import { log } from "./utilities.logging";

const scriptNameRegex = /^[a-zA-Z0-9-_. ]+$/;

/**
 * Validates the requested script.
 * @param {FormDataEntryValue | null} script The script to validate.
 * @returns {Promise<string | null>} The error string or null if passes.
 */
export const getScriptErrors = async (
  script: FormDataEntryValue | null
): Promise<string | null> => {
  try {
    if (typeof script !== "string") {
      return "The script is missing or not a string.";
    }
    if (script.length > 128) {
      return "The name of the script is too long.";
    }
    if (
      !scriptNameRegex.test(script) ||
      script.trim() !== script ||
      script.includes("..") ||
      script.startsWith("-") ||
      script.endsWith("-") ||
      script.startsWith(".") ||
      script.endsWith(".")
    ) {
      return "The script has illegal characters.";
    }
    const scriptFile = resolve("./scripts", script);
    if (scriptFile.indexOf(resolve("./scripts")) !== 0) {
      return "The script is outside of the scripts folder.";
    }
    const fileExists = await Bun.file(scriptFile).exists();
    if (!fileExists) {
      return 'The script "' + script + '" does not exist.';
    }
    return null;
  } catch (error) {
    log(error);
    return "Failed to validate script.";
  }
};

/**
 * Validates the requested arguments.
 * @param {FormDataEntryValue[] | null} args The args to validate.
 * @returns {string | null} The error string or null if passes.
 */
export const getArgsErrors = (
  args: FormDataEntryValue[] | undefined
): string | null => {
  try {
    // Args are optional.
    if (!args) return null;
    // Look for invalid args.
    if (!Array.isArray(args)) {
      return "The args is not an array.";
    }
    // Look for too many args.
    const maxArgsCount = 64;
    if (args.length > maxArgsCount) {
      return "Too many args. The limit is " + maxArgsCount + ".";
    }
    // Look for the longest arg length.
    // Don't allow extremely long args.
    const maxArgLength = 1024;
    const longestArgLength = args.reduce((a, b) => {
      if (typeof b !== "string") return a;
      return Math.max(a, b.length);
    }, 0);
    if (longestArgLength > maxArgLength) {
      return (
        "The longest arg exceeds the maximum length of " + maxArgLength + " ."
      );
    }
    return null;
  } catch (error) {
    log(error);
    return "Failed to validate args.";
  }
};

/**
 * Validates the requested files.
 * @param {FormDataEntryValue[] | null} files The files to validate.
 * @returns {Promise<string | null>} The error string or null if passes.
 */
export const getFileErrors = async (
  files: FormDataEntryValue[] | undefined
): Promise<string | null> => {
  try {
    // Files are optional.
    if (!files) return null;
    // Look for invalid files type.
    if (!Array.isArray(files)) {
      return "The files are not in an array.";
    }
    // Look for too many files.
    if (files.length > FILES_MAX_COUNT) {
      return "Too many files. The limit is " + FILES_MAX_COUNT + ".";
    }
    // Look for too large files.
    const tooLargeFiles: string[] = [];
    for (const file of files) {
      if (file instanceof File) {
        if (file.size > FILES_MAX_SIZE_IN_KB * 1024) {
          tooLargeFiles.push(file.name);
        }
      }
    }
    if (tooLargeFiles.length) {
      return (
        "The following files were too large: " +
        tooLargeFiles.join(", ") +
        ". Exceeding the maximum file size of " +
        FILES_MAX_SIZE_IN_KB +
        " KB."
      );
    }
    // Look for files with no content.
    const noContentFiles: File[] = [];
    for (const file of files) {
      if (file instanceof File) {
        if (file.size === 0) {
          noContentFiles.push(file);
        }
      }
    }
    if (noContentFiles.length) {
      return "Some files had no content.";
    }
    // Look for files with invalid extensions.
    const invalidExtensions: string[] = [];
    for (const file of files) {
      if (file instanceof File) {
        // Check the file type.
        const blob = file.slice(0, 4100);
        const fileType = await fileTypeFromBlob(blob);
        if (fileType) {
          const extension = fileType.ext;
          const extensionName = file.name.split(".").pop() || "";
          if (
            !extension ||
            !extensionName ||
            !FILES_EXTENSIONS.includes(extensionName) ||
            !FILES_EXTENSIONS.includes(extension)
          ) {
            invalidExtensions.push(file.name);
          }
        } else {
          invalidExtensions.push(file.name);
        }
      }
    }
    if (invalidExtensions.length) {
      return (
        "The following files had invalid extensions: " +
        invalidExtensions.join(", ") +
        ". Allowed extensions are: " +
        FILES_EXTENSIONS.join(", ") +
        "."
      );
    }
    return null;
  } catch (error) {
    log(error);
    return "Failed to validate files.";
  }
};
