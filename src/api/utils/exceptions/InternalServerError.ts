import { CustomError } from "./CustomError";

export class InternalServerError extends CustomError {
  errorCode = 500;
  errorType = "Internal Server Error";

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, InternalServerError.prototype);
  }

  serializeErrors(): { message: string }[] {
    return [
      {
        message: this.message,
      },
    ];
  }
}
