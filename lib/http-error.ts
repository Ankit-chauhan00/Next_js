

export type TreeError = {
  errors: string[];
  properties?: Record<string,TreeError>;
}

export class RequestError<T = unknown> extends Error {
  statusCode: number;
  errors?: T;

  constructor(
    statusCode: number,
    message: string,
    errors?: T
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "RequestError";
  }
}



export class ValidationError extends RequestError<TreeError> {
  constructor(fieldErrors: TreeError) {
    const message = ValidationError.formatTreeErrors(fieldErrors);

    super(400, message, fieldErrors);

    this.name = "ValidationError";
  }

  static formatTreeErrors(error: TreeError): string {
    const messages: string[] = [];

    function traverse(err: TreeError, path: string[] = []) {
      if (err.errors?.length) {
        const fieldName = path.join('.') || "Field";

        err.errors.forEach((msg: string) => {
          if (msg === "Required") {
            messages.push(`${fieldName} is required`);
          } else {
            messages.push(`${fieldName}: ${msg}`);
          }
        });
      }

      if (err.properties) {
        for (const key in err.properties) {
          traverse(err.properties[key], [...path, key]);
        }
      }
    }

    traverse(error);

    return messages.join(", ");
  }
}

export class NotFoundError extends RequestError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends RequestError {
  constructor(message: string = "Forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends RequestError {
  constructor(message: string = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}