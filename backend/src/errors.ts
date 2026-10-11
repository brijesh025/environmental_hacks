export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 502,
    public readonly code = "PROVIDER_ERROR",
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error.";
}
