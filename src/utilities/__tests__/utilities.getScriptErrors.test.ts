import { expect, test } from "bun:test";
import { getScriptErrors } from "../utilities.validation";

test("getScriptErrors - script is not a string", async () => {
  const result = await getScriptErrors(123 as any);
  expect(result).toEqual("The script is missing or not a string.");
});

test("getScriptErrors - script name is too long", async () => {
  const longScriptName = "a".repeat(129);
  const result = await getScriptErrors(longScriptName);
  expect(result).toEqual("The name of the script is too long.");
});

test("getScriptErrors - script name has illegal characters", async () => {
  const illegalScriptName = "script..name";
  const result = await getScriptErrors(illegalScriptName);
  expect(result).toEqual("The script has illegal characters.");
});

test("getScriptErrors - script does not exist", async () => {
  const nonExistentScript = "nonExistentScript";
  const result = await getScriptErrors(nonExistentScript);
  expect(result).toEqual(`The script "${nonExistentScript}" does not exist.`);
});
