/**
 * Returns the current system time.
 * @returns {string}
 */
const getTime = (): string => new Date().toISOString();

/**
 * Writes a log message for monitoring purposes.
 * @param {unknown[]} args The arguments to log.
 */
export const log = (...args: unknown[]): void =>
  console.info(getTime(), ...args);
