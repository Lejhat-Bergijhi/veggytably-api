import { PrismaClient } from "@prisma/client";
import { InternalServerError } from "../utils/exceptions/InternalServerError";

const prisma = new PrismaClient();

export async function findVouchers() {
  const vouchers = await prisma.voucher.findMany({
    include: {
      customer: true,
    },
  });

  return vouchers;
}

export async function createVoucher(data: {
  discount: number;
  maximumDiscount: number;
  minimumPurchase: number;
  logo: string | undefined;
  title: string;
  description: string;
  details: string;
  expiryDate: string;
}) {
  // distribute voucher to all customers
  const customers = await prisma.customer.findMany();

  // parse date
  const expiryDate = new Date(data.expiryDate);

  // iterate through all customers and create a voucher for each
  for (const customer of customers) {
    const voucher = await prisma.voucher.create({
      data: {
        discount: data.discount,
        maximumDiscount: data.maximumDiscount,
        minimumPurchase: data.minimumPurchase,
        logo: data.logo ? data.logo : undefined,
        title: data.title,
        description: data.description,
        details: data.details,
        expiryDate: expiryDate,
        customerId: customer.id,
      },
    });

    if (!voucher) {
      throw new InternalServerError(
        `Failed to create voucher for customer: ${customer.id}}`
      );
    }
  }

  return true;
}
