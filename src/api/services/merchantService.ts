import { PrismaClient } from "@prisma/client";
import { InternalServerError } from "../utils/exceptions/InternalServerError";
import { BadRequestError } from "../utils/exceptions/BadRequestError";
import { Request } from "express";
import {
  decodeRestriction,
  filterMenuByRestriction,
} from "../utils/restrictions";
import { imageIdToUrl } from "../utils/imageUrl";

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
    restrictions,
  }: {
    name: string;
    price: number;
    description: string;
    imageId: string | undefined;
    inStock: boolean | undefined;
    restrictions: boolean[] | undefined;
  }
) {
  // check if name, price is empty
  if (!name || !price) throw new BadRequestError("Invalid input");
  if (restrictions.length !== 6)
    throw new BadRequestError("Invalid restrictions input");

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
      restrictions: restrictions,
    },
  });

  if (!menu) throw new InternalServerError("Failed to create menu");

  return menu;
}

export async function findMerchant(limit = 10, offset = 0, search = "") {
  if (search.length < 3) return [];

  const merchants = await prisma.merchant.findMany({
    where: {
      restaurantName: {
        contains: search,
        mode: "insensitive",
      },
    },
    skip: offset,
    take: limit,
  });

  // add random price and estimated duration to each merchant
  const merchantsWithPriceAndDuration = merchants.map((merchant) => {
    const randomPrice = (Math.floor(Math.random() * 100) + 1) * 1000;
    const randomDuration = Math.floor(Math.random() * 60) + 1;

    return {
      ...merchant,
      price: randomPrice,
      duration: randomDuration,
    };
  });

  return merchantsWithPriceAndDuration;
}

export async function searchMenu(
  limit = 10,
  offset = 0,
  search = "",
  restrictions: boolean[] = [false, false, false, false, false, false],
  req: Request
) {
  // if (search.length < 3) return [];

  const menus = await prisma.menu.findMany({
    where: {
      name: {
        contains: search,
        mode: "insensitive",
      },
    },
  });

  // filter restrictions
  const filteredMenus = filterMenuByRestriction(menus, restrictions);

  // filter limit and offset
  const slicedMenus = filteredMenus.slice(offset, offset + limit);

  // append image url
  const menusWithImageUrl = slicedMenus.map((menu) => {
    return {
      ...menu,
      imageUrl: imageIdToUrl(menu.imageId, req),
    };
  });

  return menusWithImageUrl;
}

export async function findMenuById(menuId: string) {
  const menu = await prisma.menu.findUnique({
    where: {
      id: menuId,
    },
  });

  if (!menu) throw new BadRequestError("Menu not found!");

  // decode restrictions array to object
  const restrictions = decodeRestriction(menu.restrictions);

  const { merchantId, ...restMenu } = menu;

  return {
    ...restMenu,
    restrictions,
  };
}

export async function findMenuByMerchantId(
  merchantId: string,
  limit = 10,
  offset = 0,
  restrictions: boolean[] = [false, false, false, false, false, false],
  req: Request
) {
  const menus = await prisma.menu.findMany({
    where: {
      merchantId: merchantId,
    },
  });

  // filter restrictions
  const filteredMenus = filterMenuByRestriction(menus, restrictions);

  // filter limit and offset
  const slicedMenus = filteredMenus.slice(offset, offset + limit);

  // append image url
  const menusWithImageUrl = slicedMenus.map((menu) => {
    return {
      ...menu,
      imageUrl: imageIdToUrl(menu.imageId, req),
    };
  });

  return menusWithImageUrl;
}

export async function findMenuByUserId(userId: string) {
  const merchant = await prisma.merchant.findUnique({
    where: {
      userId: userId,
    },
  });

  const menus = await prisma.menu.findMany({
    where: {
      merchantId: merchant.id,
    },
  });

  return menus;
}

export async function updateMenu(
  menuId: string,
  {
    name,
    price,
    description,
    imageId,
    inStock,
    restrictions,
  }: {
    name: string;
    price: number;
    description: string;
    imageId: string;
    inStock: boolean | undefined;
    restrictions: boolean[] | undefined;
  }
) {
  if (!name || !price) throw new BadRequestError("Invalid input");
  if (restrictions?.length !== 6)
    throw new BadRequestError("Invalid restrictions input");

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
      restrictions: restrictions,
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
