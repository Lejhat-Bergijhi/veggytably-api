import { CustomError } from "./CustomError";

export class BadRequestError extends CustomError {
  errorCode = 500;
  errorType = "Internal Server Error";

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors(): { message: string }[] {
    return [
      {
        message: this.message,
      },
    ];
  }
}
