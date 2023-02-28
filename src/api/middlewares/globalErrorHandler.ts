import { Request, Response, NextFunction } from "express";
import { isCustomError, serializeErrorMessage } from "../utils/exceptions";

export default function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(isCustomError(error) ? error.errorCode : 500).json({
    errors: serializeErrorMessage(error),
  });
}
