import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { BadRequestError } from "../utils/exceptions/BadRequestError";
import { InternalServerError } from "../utils/exceptions/InternalServerError";
import { Request } from "express";
import { UnauthorizedError } from "../utils/exceptions/UnauthorizedError";

const prisma = new PrismaClient();

export async function registerMerchant({ username, password, email }) {
  // TODO: validate data
  if (!username || !password || !email)
    throw new BadRequestError("Invalid data!");

  const duplicateUsername = await prisma.merchant.findUnique({
    where: {
      username: username,
    },
  });

  if (duplicateUsername)
    throw new BadRequestError("Username has already been taken!");

  const duplicateEmail = await prisma.merchant.findUnique({
    where: { email: email },
  });

  if (duplicateEmail)
    throw new BadRequestError("Email has already been taken!");

  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.SALT_ROUNDS)
  );

  const userData = await prisma.merchant.create({
    data: {
      username: username,
      password: hashedPassword,
      email: email,
    },
  });

  if (!userData)
    throw new InternalServerError("Failed to add new user! Please try again.");

  return {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    tokenVersion: userData.tokenVersion,
  };
}

export async function loginMerchant({ email, password }) {
  // TODO validate data
  if (!email || !password) throw new BadRequestError("Invalid data!");

  const user = await prisma.merchant.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) throw new BadRequestError("User not found!");

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new BadRequestError("Invalid credentials!");

  return user;
}

export async function verifyRefreshToken(req: Request) {
  const token = req.cookies.jid;
  if (!token) throw new BadRequestError("Refresh token not included!");

  const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);

  if (!payload) throw new BadRequestError("Invalid refresh token!");

  // TODO: validate payload
  const { userId, tokenVersion } = payload as any;

  const user = await prisma.merchant.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) throw new BadRequestError("User not found!");

  if (user.tokenVersion !== tokenVersion)
    throw new UnauthorizedError("Invalid refresh token!");

  return user;
}

export async function revokeRefreshToken(userId: string) {
  const user = await prisma.merchant.update({
    where: {
      id: userId,
    },
    data: {
      tokenVersion: {
        increment: 1,
      },
    },
  });

  if (!user) throw new BadRequestError("User not found!");
}
