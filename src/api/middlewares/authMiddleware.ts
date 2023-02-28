import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { BadRequestError } from "../utils/exceptions/BadRequestError";

export function isUserAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers["authorization"];

  if (!authorization)
    throw new BadRequestError("Authorization header not included!");

  const token = authorization.split(" ")[1];
  // TODO:refresh token or access token
  const payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);

  res.locals.user = payload;

  return next();
}
