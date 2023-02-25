import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { BadRequestError } from "../utils/exceptions/BadRequestError";
import { InternalServerError } from "../utils/exceptions/InternalServerError";

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
