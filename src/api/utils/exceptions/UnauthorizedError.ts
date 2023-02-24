import { CustomError } from "./CustomError";

export class UnauthorizedError extends CustomError {
  errorCode = 401;
  errorType = "Internal Server Error";

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeErrors(): { message: string }[] {
    return [
      {
        message: this.message,
      },
    ];
  }
}
