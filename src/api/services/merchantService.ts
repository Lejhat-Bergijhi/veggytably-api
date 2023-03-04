import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getProfileById(userId: string) {
  const user = await prisma.merchant.findUnique({
    where: {
      id: userId,
    },
  });

  const { password, tokenVersion, ...rest } = user;

  return rest;
}
