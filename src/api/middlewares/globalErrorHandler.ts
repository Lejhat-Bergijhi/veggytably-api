import { Request, Response, NextFunction } from "express";
import { serializeErrorMessage } from "../utils/exceptions";

export default function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.json({
    errors: serializeErrorMessage(error),
  });
}
