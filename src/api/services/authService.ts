import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { BadRequestError } from "../utils/exceptions/BadRequestError";

const prisma = new PrismaClient();

export async function registerMerchant({ username, password, email }) {
  // TODO: validate data
  if (!username || !password || !email)
    throw new BadRequestError("Invalid data!");

  const duplicateUser = await prisma.merchant.findUnique({
    where: {
      username: username,
    },
  });

  if (duplicateUser) throw new Error("Username has already been taken!");

  const hashedPassword = await bcrypt.hash(
    password,
    Number(process.env.SALT_ROUNDS)
  );

  const result = await prisma.merchant.create({
    data: {
      username: username,
      password: hashedPassword,
      email: email,
    },
  });

  if (!result) throw new Error("Failed to add new user! Please try again.");

  return result;
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
