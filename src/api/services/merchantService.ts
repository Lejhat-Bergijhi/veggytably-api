import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getProfileById(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  const merchant = await prisma.merchant.findUnique({
    where: {
      userId: userId,
    },
  });

  const { password, tokenVersion, role, ...restUser } = user;

  const { userId: _, ...restMerchant } = merchant;

  return {
    ...restUser,
    ...restMerchant,
  };
}
