import { CustomError } from "./CustomError";

export class ValidationError extends CustomError {
  errorCode = 403;
  errorType = "Internal Server Error";

  constructor(message: string, private property: string) {
    super(message);

    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  serializeErrors(): { message: string; property: string }[] {
    return [
      {
        message: this.message,
        property: this.property,
      },
    ];
  }
}
