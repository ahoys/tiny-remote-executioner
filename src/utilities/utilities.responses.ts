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
  const { status, ...body } = data;
  if (process.env.QUIET !== undefined && process.env.QUIET !== "false") {
    return new Response(null, { status });
  }
  return new Response(JSON.stringify(body), { status });
};
