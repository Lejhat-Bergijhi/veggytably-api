import { PrismaClient, Role } from "@prisma/client";
import { BadRequestError } from "../utils/exceptions/BadRequestError";
import { InternalServerError } from "../utils/exceptions/InternalServerError";

const prisma = new PrismaClient();

export async function getTransactionsByUserId(userId: string, role: Role) {
  if (!userId) {
    throw new BadRequestError("userId is required.");
  }

  if (!(role in Role)) {
    console.log(role);
    throw new BadRequestError("Invalid role.");
  }

  const userRole = prisma[role.toLowerCase()].findUnique({
    where: {
      userId: userId,
    },
  });

  if (!userRole) {
    throw new BadRequestError(`${role} not found.`);
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      [`${role.toLowerCase()}Id`]: {
        equals: userRole.id,
      },
    },
  });

  return transactions;
}

export async function createTransaction(
  userId: string,
  cartId: string,
  merchantId: string
) {
  if (!userId || !cartId || !merchantId) {
    throw new BadRequestError("userId, cartId, and merchantId are required.");
  }

  const customer = await prisma.customer.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!customer) {
    throw new BadRequestError("Customer not found.");
  }

  const cart = await prisma.cart.findUnique({
    where: {
      id: cartId,
    },
  });

  if (!cart) {
    throw new BadRequestError("Cart not found.");
  }

  const merchant = await prisma.merchant.findUnique({
    where: {
      id: merchantId,
    },
  });

  if (!merchant) {
    throw new BadRequestError("Merchant not found.");
  }

  const transaction = await prisma.transaction.create({
    data: {
      cart: {
        connect: {
          id: cartId,
        },
      },
      customer: {
        connect: {
          id: customer.id,
        },
      },
      merchant: {
        connect: {
          id: merchant.id,
        },
      },
    },
  });

  if (!transaction) {
    throw new InternalServerError("Failed to create transaction.");
  }

  return transaction;
}
