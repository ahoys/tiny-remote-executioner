import { expect, test } from "bun:test";
import {
  FILES_EXTENSIONS,
  FILES_MAX_SIZE_IN_KB,
  FILES_MAX_COUNT,
} from "../../index";
import { getFileErrors } from "../utilities.validation";

test("getScriptErrors - should return null if no files are passed", () => {
  expect(getFileErrors(undefined)).toBeNull();
});

test("getScriptErrors - should return error if files are not in an array", () => {
  const files = {} as any;
  expect(getFileErrors(files)).toEqual("The files are not in an array.");
});

test("getScriptErrors - should return error if too many files are passed", () => {
  const files = new Array(FILES_MAX_COUNT + 1).fill(new File([], "test.jpg"));
  expect(getFileErrors(files)).toEqual(
    `Too many files. The limit is ${FILES_MAX_COUNT}.`
  );
});

test("getScriptErrors - should return error if file size is too large", () => {
  const files = [
    new File(["a".repeat(FILES_MAX_SIZE_IN_KB * 1024 + 1)], "test.jpg"),
  ];
  expect(getFileErrors(files)).toEqual(
    `The following files were too large: test.jpg. Exceeding the maximum file size of ${FILES_MAX_SIZE_IN_KB} KB.`
  );
});

test("getScriptErrors - should return error if file has no content", () => {
  const files = [new File([], "test.jpg")];
  expect(getFileErrors(files)).toEqual("Some files had no content.");
});

test("getScriptErrors - should return error if file has invalid extension", () => {
  const files = [new File(["a"], "test.xyz")];
  expect(getFileErrors(files)).toEqual(
    `The following files had invalid extensions: test.xyz. Allowed extensions are: ${FILES_EXTENSIONS.join(
      ", "
    )}.`
  );
});

test("getScriptErrors - should return null if all files are valid", () => {
  const files = [new File(["a"], "test.jpg")];
  expect(getFileErrors(files)).toBeNull();
});
