import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { BadRequestError } from "../utils/exceptions/BadRequestError";
import { PrismaClient, Role } from "@prisma/client";
import { UnauthorizedError } from "../utils/exceptions/UnauthorizedError";

const prisma = new PrismaClient();

export function isUserAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.headers["authorization"];

  if (!authorization)
    throw new BadRequestError("Authorization header not included!");

  const token = authorization.split(" ")[1];
  // TODO:refresh token or access token?
  const payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);

  res.locals.user = payload;

  return next();
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // extends isUserAuth
  isUserAuth(req, res, next);

  const { role } = res.locals.user;

  if (role !== "ADMIN") {
    throw new UnauthorizedError("User is not an Admin!");
  }
}

export async function publicMerchantRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { role } = res.locals.user;

  if (role != Role.MERCHANT) {
    throw new UnauthorizedError("User is not a Merchant!");
  }

  return next();
}

export async function privateMerchantRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { menuId } = req.params;

  if (!menuId) throw new BadRequestError("Menu id not included in parameters!");

  // find merchantId from menuId
  const menu = await prisma.menu.findUnique({
    where: {
      id: menuId,
    },
  });

  if (!menu) throw new BadRequestError("Menu not found!");

  const merchant = await prisma.merchant.findUnique({
    where: {
      id: menu.merchantId,
    },
  });

  if (merchant.userId != res.locals.user.userId) {
    throw new UnauthorizedError("Menu doesn't belong to merchant!");
  }

  return next();
}
