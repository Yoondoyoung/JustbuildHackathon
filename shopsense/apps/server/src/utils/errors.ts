export class SourceRequestError extends Error {
  constructor(
    public readonly source: "amazon" | "google" | "walmart",
    public readonly code: string,
    message: string,
    public readonly retryable: boolean
  ) {
    super(message);
    this.name = "SourceRequestError";
    Object.setPrototypeOf(this, SourceRequestError.prototype);
  }
}

export interface SourceError {
  source: "amazon" | "google" | "walmart";
  code: string;
  message: string;
  retryable: boolean;
}

export function toSourceError(err: unknown): SourceError | null {
  if (err instanceof SourceRequestError) {
    return {
      source: err.source,
      code: err.code,
      message: err.message,
      retryable: err.retryable,
    };
  }
  return null;
}
