import { PrismaClient } from "@prisma/client";
import { BadRequestError } from "../utils/exceptions/BadRequestError";
import { UnauthorizedError } from "../utils/exceptions/UnauthorizedError";

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

export async function getCustomerCart(userId: string) {
  const cart = await prisma.cart.findMany({
    where: {
      customerId: userId,
    },
    include: {
      cartItem: true,
    },
  });

  return cart;
}

export async function getCartUnique(userId: string, merchantId: string) {
  const cart = await prisma.cart.findUnique({
    where: {
      customerId_merchantId: {
        customerId: userId,
        merchantId: merchantId,
      },
    },
    include: {
      cartItem: {
        include: {
          menu: true,
        },
      },
    },
  });

  return cart;
}

export async function updateCustomerCart(
  userId: string,
  merchantId: string,
  payload: { menuId: string; quantity: number }
) {
  if (
    !payload.menuId ||
    payload.quantity === null ||
    payload.quantity === undefined
  )
    throw new BadRequestError("Invalid payload!");

  console.log(payload.quantity === null);
  if (payload.quantity < 0) throw new BadRequestError("Invalid quantity!");

  // check if cart exist
  const cart = await getCartByCustomerIdAndMerchantId(userId, merchantId);

  // check if menu exist
  const menu = await prisma.menu.findUnique({
    where: {
      id: payload.menuId,
    },
  });

  if (!menu) throw new BadRequestError("Menu not found!");

  // if quantity is 0, delete cart item
  if (payload.quantity === 0) {
    const isExist = await prisma.cartItem.findUnique({
      where: {
        cartId_menuId: {
          cartId: cart.id,
          menuId: menu.id,
        },
      },
    });

    if (!isExist) throw new BadRequestError("Cart item not found!");

    const deletedCartItem = await prisma.cartItem.delete({
      where: {
        cartId_menuId: {
          cartId: cart.id,
          menuId: menu.id,
        },
      },
      include: {
        menu: true,
      },
    });

    return deletedCartItem;
  }

  // create (if not exist) or update cart item
  const cartItem = await prisma.cartItem.upsert({
    where: {
      cartId_menuId: {
        cartId: cart.id,
        menuId: menu.id,
      },
    },
    update: {
      quantity: payload.quantity,
    },
    create: {
      quantity: payload.quantity,
      cart: {
        connect: {
          id: cart.id,
        },
      },
      menu: {
        connect: {
          id: menu.id,
        },
      },
    },
    include: {
      menu: true,
    },
  });

  return cartItem;
}

export async function deleteCustomerCart(userId: string, merchantId: string) {
  // check if cart exist
  const cart = await getCartByCustomerIdAndMerchantId(userId, merchantId);

  // delete cart
  const deletedCart = await prisma.cart.delete({
    where: {
      id: cart.id,
    },
  });

  return deletedCart;
}

async function getCartByCustomerIdAndMerchantId(
  userId: string,
  merchantId: string
) {
  const cart = await prisma.cart.findFirst({
    where: {
      customerId: userId,
      merchantId: merchantId,
    },
  });

  if (!cart) {
    // create new cart
    const newCart = await prisma.cart.create({
      data: {
        customerId: userId,
        merchantId: merchantId,
      },
    });
    return newCart;
  }

  return cart;
}
