import { CartItem, PaymentMethod, PrismaClient, Role } from "@prisma/client";
import { BadRequestError } from "../utils/exceptions/BadRequestError";
import { InternalServerError } from "../utils/exceptions/InternalServerError";
import { addressService } from "./addressService";
import { Ors, ors } from "../utils/ors";

class TransactionService {
  private prisma: PrismaClient;
  private ors: Ors;

  constructor() {
    this.prisma = new PrismaClient();
    this.ors = ors;
  }

  public async getTransactionById(transactionId: string) {
    if (!transactionId) {
      throw new BadRequestError("transactionId is required.");
    }

    const transaction = await this.prisma.transaction.findUnique({
      where: {
        id: transactionId,
      },
      include: {
        cart: {
          include: {
            cartItem: {
              include: {
                menu: true,
              },
            },
          },
        },
        customer: {
          include: {
            user: true,
          },
        },
        merchant: true,
        driver: true,
      },
    });

    if (!transaction) {
      throw new BadRequestError("Transaction not found.");
    }

    return transaction;
  }

  public async getTransactionsByUserId(userId: string, role: Role) {
    if (!userId) {
      throw new BadRequestError("userId is required.");
    }

    if (!(role in Role)) {
      throw new BadRequestError("Invalid role.");
    }

    const userRole = this.prisma[role.toLowerCase()].findUnique({
      where: {
        userId: userId,
      },
    });

    if (!userRole) {
      throw new BadRequestError(`${role} not found.`);
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        [`${role.toLowerCase()}Id`]: {
          equals: userRole.id,
        },
      },
      include: {
        cart: {
          include: {
            cartItem: true,
          },
        },
        customer: {
          include: {
            user: true,
          },
        },
        merchant: true,
        driver: true,
      },
    });

    return transactions;
  }

  public async createTransaction(
    userId: string,
    cartId: string,
    merchantId: string,
    paymentMethod: string,
    customerAddress: {
      coordinates: {
        latitude: number;
        longitude: number;
      } | null;
      address: string | null;
    }
  ) {
    if (
      !userId ||
      !cartId ||
      !merchantId ||
      !paymentMethod ||
      !customerAddress
    ) {
      throw new BadRequestError(
        "userId, cartId, merchantId, paymentMethod, customerAddress are required."
      );
    }

    const customer = await this.prisma.customer.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!customer) {
      throw new BadRequestError("Customer not found.");
    }

    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
      },
      include: {
        cartItem: {
          include: {
            menu: true,
          },
        },
      },
    });

    if (!cart) {
      throw new BadRequestError("Cart not found.");
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: {
        id: merchantId,
      },
    });

    if (!merchant) {
      throw new BadRequestError("Merchant not found.");
    }

    // create address from input
    if (!customerAddress.coordinates && !customerAddress.address) {
      throw new BadRequestError("coordinates or address is required.");
    }

    const cusAdr = await addressService.createAddress(customerAddress);

    // TODO: implement merchant address
    const merchantAdr = await this.prisma.address.findUnique({
      where: {
        id: "646b3c4324a69f8b9766d55d", // mipa ugm
      },
    });

    // validate payment method
    // check if wallet balance is enough
    if (paymentMethod === PaymentMethod.WALLET) {
      const walletBalance = await this.prisma.user.findUnique({
        where: {
          id: customer.userId,
        },
        select: {
          wallet: true,
        },
      });

      // calculate total price
      const totalPrice = this.totalPriceByCartItems(cart.cartItem);

      if (walletBalance.wallet < totalPrice) {
        throw new BadRequestError("Wallet balance is not enough.");
      }
    }

    if (!(paymentMethod in PaymentMethod)) {
      throw new BadRequestError("Invalid payment method.");
    }

    const transaction = await this.prisma.transaction.create({
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
        customerAddress: {
          connect: {
            id: cusAdr.id,
          },
        },
        pickupAddress: {
          connect: {
            id: merchantAdr.id,
          },
        },
        paymentMethod: paymentMethod as PaymentMethod,
      },
      include: {
        cart: {
          include: {
            cartItem: {
              include: {
                menu: true,
              },
            },
          },
        },
        customer: {
          include: {
            user: true,
          },
        },
        merchant: true,
        driver: true,
      },
    });

    if (!transaction) {
      throw new InternalServerError("Failed to create transaction.");
    }

    return {
      transaction: transaction,
      quantity: cart.cartItem.length,
      customerAddress: cusAdr,
      merchantAddress: merchantAdr,
      totalPrice: this.totalPriceByCartItems(cart.cartItem),
    };
  }

  public totalPriceByCartItems(cartItems: any) {
    // calculate total price
    let totalPrice = 0;
    cartItems.forEach((item) => {
      totalPrice += item.menu.price * item.quantity;
    });

    return totalPrice;
  }

  public async getMerchant2CustomerRoute(
    merchantLocation: { latitude: number; longitude: number },
    customerLocation: { latitude: number; longitude: number }
  ) {
    const merchantToCustomer = await this.ors.getDirections(
      merchantLocation,
      customerLocation
    );

    const merchantToCustomerRoute =
      this.ors.parseDirectionResponse(merchantToCustomer);

    const route = {
      merchantToCustomer: merchantToCustomerRoute,
    };

    return route;
  }

  public async acceptOrder(userId: string, transactionId: string) {
    if (!userId || !transactionId) {
      throw new BadRequestError("userId and transactionId are required.");
    }

    const driver = await this.prisma.driver.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!driver) {
      throw new BadRequestError("Driver not found.");
    }

    const transaction = await this.prisma.transaction.update({
      where: {
        id: transactionId,
      },
      data: {
        driver: {
          connect: {
            id: driver.id,
          },
        },
      },
    });

    if (!transaction) {
      throw new BadRequestError("Transaction not found.");
    }

    return transaction;
  }
}

export const transactionService = new TransactionService();
