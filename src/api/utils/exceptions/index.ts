import { CustomError } from "./CustomError";
import { InternalServerError } from "./InternalServerError";
import { BadRequestError } from "./BadRequestError";
import { NotFoundError } from "./NotFoundError";
import { UnauthorizedError } from "./UnauthorizedError";

export function isCustomError(error: unknown): error is CustomError {
  return error instanceof CustomError;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function serializeErrorMessage(error: unknown) {
  if (isCustomError(error)) return error.serializeErrors();
  if (error instanceof Error) return error.message;
  return String(error);
}

export default {
  InternalServerError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
};
