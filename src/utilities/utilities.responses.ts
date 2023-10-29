import { log } from "./utilities.logging";

export interface ITreResponse {
  error?: string;
  stdout?: string;
  stderr?: string;
  status: number;
}

/**
 * Creates a response with the given data.
 * @param data The data to send.
 * @returns {Response} The response.
 */
export const createResponse = (data: ITreResponse): Response => {
  try {
    if (data.stderr) {
      log(data.stderr);
    }
    if (data.error) {
      log(data.error);
    }
    const { status, ...body } = data;
    if (process.env.VERBOSE === true.toString()) {
      return new Response(JSON.stringify(body), { status });
    }
    return new Response(null, { status });
  } catch (error) {
    log(error);
    return new Response(null, { status: 500 });
  }
};
