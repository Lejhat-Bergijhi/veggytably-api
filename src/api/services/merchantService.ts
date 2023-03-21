import { PrismaClient } from "@prisma/client";
import { InternalServerError } from "../utils/exceptions/InternalServerError";
import { BadRequestError } from "../utils/exceptions/BadRequestError";

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

  const { password, tokenVersion, role, profilePicture, ...restUser } = user;

  const { userId: _, ...restMerchant } = merchant;

  return {
    ...restUser,
    ...restMerchant,
  };
}

export async function updateProfileById(
  userId: string,
  username: string,
  email: string,
  phone: string,
  restaurantName: string,
  restaurantAddress: string
) {
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

  const merchant = await prisma.merchant.update({
    where: {
      userId: userId,
    },
    data: {
      restaurantAddress: restaurantAddress,
      restaurantName: restaurantName,
    },
  });

  const { password, tokenVersion, role, profilePicture, ...restUser } = user;

  const { userId: _, ...restMerchant } = merchant;

  return {
    ...restUser,
    ...restMerchant,
  };
}

export async function createMenu(
  userId: string,
  {
    name,
    price,
    description,
    imageId,
    inStock,
  }: {
    name: string;
    price: number;
    description: string;
    imageId: string | undefined;
    inStock: boolean | undefined;
  }
) {
  // find merchant by userId
  const merchant = await prisma.merchant.findUnique({
    where: {
      userId: userId,
    },
  });

  const menu = await prisma.menu.create({
    data: {
      name: name,
      price: price,
      description: description,
      imageId: imageId,
      merchantId: merchant.id,
      inStock: inStock,
    },
  });

  if (!menu) throw new InternalServerError("Failed to create menu");

  return menu;
}

export async function findMenuById(menuId: string) {
  const menu = await prisma.menu.findUnique({
    where: {
      id: menuId,
    },
  });

  if (!menu) throw new BadRequestError("Menu not found!");

  return menu;
}

export async function findMenu(userId: string) {
  const merchant = await prisma.merchant.findUnique({
    where: {
      userId: userId,
    },
  });

  const menu = await prisma.menu.findMany({
    where: {
      merchantId: merchant.id,
    },
  });

  return menu;
}

export async function updateMenu(
  menuId: string,
  {
    name,
    price,
    description,
    imageId,
    inStock,
  }: {
    name: string;
    price: number;
    description: string;
    imageId: string;
    inStock: boolean | undefined;
  }
) {
  await menuExists(menuId);

  const menu = await prisma.menu.update({
    where: {
      id: menuId,
    },
    data: {
      name: name,
      price: price,
      description: description,
      imageId: imageId,
      inStock: inStock,
    },
  });

  if (!menu) {
    throw new InternalServerError(
      "Failed to update menu. Check if menu exists."
    );
  }

  return menu;
}

export async function deleteMenuById(menuId: string) {
  await menuExists(menuId);

  const menu = await prisma.menu.delete({
    where: {
      id: menuId,
    },
  });

  if (!menu) throw new InternalServerError("Failed to delete menu");
  return true;
}

export async function uploadImage(image: Buffer) {
  const menuImage = await prisma.menuImage.create({
    data: {
      image: image,
    },
  });

  if (!menuImage) throw new InternalServerError("Failed to upload menu image");

  return menuImage;
}

export async function findMenuImage(imageId: string) {
  const menuImage = await prisma.menuImage.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!menuImage) throw new BadRequestError("Image not found!");

  return menuImage.image;
}

export async function deleteMenuImageById(imageId: string) {
  const menuImage = await prisma.menuImage.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!menuImage) throw new BadRequestError("Image not found!");

  await prisma.menuImage.delete({
    where: {
      id: imageId,
    },
  });

  // update menu imageId to null
  await prisma.menu.updateMany({
    where: {
      imageId: imageId,
    },
    data: {
      imageId: null,
    },
  });

  return true;
}

async function menuExists(menuId: string) {
  const menu = await prisma.menu.findUnique({
    where: {
      id: menuId,
    },
  });

  if (!menu) throw new BadRequestError("Menu not found!");

  return true;
}
