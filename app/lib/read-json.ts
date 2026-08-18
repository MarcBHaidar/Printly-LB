// A response body is not always JSON: an unhandled throw in a route handler
// returns an empty or HTML 5xx. Calling response.json() on that rejects, and an
// unguarded `await response.json()` strands the caller with its busy flag still
// set — the form then hangs instead of showing the error.
export async function readJson<T = Record<string, unknown>>(response: Response): Promise<Partial<T>> {
  try {
    return (await response.json()) as Partial<T>;
  } catch {
    return {};
  }
}

// Message for a failed request, preferring the API's own `{ error }` envelope.
export function requestError(status: number, error?: string, fallback = "Something went wrong. Please try again.") {
  if (error) return error;
  return status >= 500 ? `The server could not complete the request (${status}).` : fallback;
}
