import { PrismaClient } from "@prisma/client";
import { BadRequestError } from "../utils/exceptions/BadRequestError";

const prisma = new PrismaClient();

export async function updateCustomerProfile(userId: string, data: any) {
  const { username, email, phone } = data;

  const u = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (u.email !== email) {
    const duplicateEmail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (duplicateEmail) throw new BadRequestError("Email already exists!");
  }

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      username: username,
      email: email,
      phone: phone,
    },
  });

  if (!user) throw new BadRequestError("Failed to update profile!");

  return user;
}
