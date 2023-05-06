import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getWalletByUserId(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user.wallet;
}
export async function incrementWalletByUserId(userId: string, amount: number) {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      wallet: {
        increment: amount,
      },
    },
  });

  return user.wallet;
}

export async function decrementWalletByUserId(userId: string, amount: number) {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      wallet: {
        decrement: amount,
      },
    },
  });

  return user.wallet;
}
