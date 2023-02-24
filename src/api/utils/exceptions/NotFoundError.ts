import { CustomError } from "./CustomError";

export class NotFoundError extends CustomError {
  errorCode = 404;
  errorType = "Not Found";

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors(): { message: string }[] {
    return [
      {
        message: this.message,
      },
    ];
  }
}
