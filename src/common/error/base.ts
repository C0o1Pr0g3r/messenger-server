type BaseErrorOptions = {
  message?: string | undefined;
  cause?: unknown;
};

abstract class BaseError<T extends boolean> extends Error {
  constructor(
    readonly isOperational: T,
    options?: BaseErrorOptions,
  ) {
    super(options?.message, {
      cause: options?.cause,
    });
  }
}

export { BaseError };
export type { BaseErrorOptions };
