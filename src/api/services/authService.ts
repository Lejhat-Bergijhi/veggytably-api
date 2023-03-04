import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { BadRequestError } from "../utils/exceptions/BadRequestError";
import { InternalServerError } from "../utils/exceptions/InternalServerError";
import { Request } from "express";
import { UnauthorizedError } from "../utils/exceptions/UnauthorizedError";

const prisma = new PrismaClient();

async function createUser({ username, email, password, phone, role }) {
  // TODO: validate data
  if (!username || !email || !password || !phone || !role)
    throw new BadRequestError("Invalid data!");

  const duplicateEmail = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (duplicateEmail)
    throw new BadRequestError("Email has already been taken!");

  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.SALT_ROUNDS)
  );

  const user = await prisma.user.create({
    data: {
      username: username,
      email: email,
      password: hashedPassword,
      phone: phone,
      role: role,
    },
  });

  if (!user)
    throw new InternalServerError("Failed to add new user! Please try again.");

  const { password: _, ...userData } = user;

  return userData;
}

export async function registerMerchant({
  username,
  password,
  phone,
  email,
  restaurantName,
  restaurantAddress,
}) {
  const userData = await createUser({
    username,
    password,
    phone,
    email,
    role: Role.MERCHANT,
  });
  if (!userData) throw new InternalServerError("Failed to add new user!");

  const merchantData = await prisma.merchant.create({
    data: {
      user: {
        connect: {
          id: userData.id,
        },
      },
      restaurantName: restaurantName,
      restaurantAddress: restaurantAddress,
    },
  });

  if (!merchantData)
    throw new InternalServerError(
      "Failed to add new merchant! Please try again."
    );

  return {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    phone: userData.phone,
    role: userData.role,
    tokenVersion: userData.tokenVersion,
  };
}

export async function registerDriver({
  username,
  password,
  phone,
  email,
  licensePlate,
}) {
  // TODO: implement Driver registration
  const userData = await createUser({
    username,
    password,
    phone,
    email,
    role: Role.DRIVER,
  });
  if (!userData) throw new InternalServerError("Failed to add new user!");

  const driverData = await prisma.driver.create({
    data: {
      user: {
        connect: {
          id: userData.id,
        },
      },
      licensePlate: licensePlate,
    },
  });
  if (!driverData) throw new InternalServerError("Failed to add new driver!");

  return {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    phone: userData.phone,
    role: userData.role,
    tokenVersion: userData.tokenVersion,
  };
}

export async function login({ email, password, role }) {
  // TODO validate data
  if (!email || !password) throw new BadRequestError("Invalid data!");
  if (!role) throw new BadRequestError("Invalid request!");

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) throw new BadRequestError("User not found!");

  if (user.role !== role) throw new BadRequestError("User not found!");

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

  const user = await prisma.user.findUnique({
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
  const user = await prisma.user.update({
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
