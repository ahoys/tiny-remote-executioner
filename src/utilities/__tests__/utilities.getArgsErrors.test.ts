import { expect, test } from "bun:test";
import { getArgsErrors } from "../utilities.validation";

test("getArgsErrors - args is not an array", () => {
  const result = getArgsErrors("notArray" as any);
  expect(result).toEqual("The args is not an array.");
});

test("getArgsErrors - too many args", () => {
  const tooManyArgs = Array.from({ length: 65 }, () => "a");
  const result = getArgsErrors(tooManyArgs);
  expect(result).toEqual("Too many args. The limit is 64.");
});

test("getArgsErrors - longest arg exceeds the maximum length", () => {
  const longArg = Array.from({ length: 1025 }, () => "a").join("");
  const args = [longArg];
  const result = getArgsErrors(args);
  expect(result).toEqual(
    "The longest arg exceeds the maximum length of 1024 ."
  );
});

test("getArgsErrors - args are valid", () => {
  const validArgs = ["arg1", "arg2"];
  const result = getArgsErrors(validArgs);
  expect(result).toEqual(null);
});

test("getArgsErrors - args are optional", () => {
  const result = getArgsErrors([]);
  expect(result).toEqual(null);
});
