import { PrismaClient } from "@prisma/client";
import { InternalServerError } from "../utils/exceptions/InternalServerError";

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

  if (!menuImage) throw new InternalServerError("Failed to find menu image");

  return menuImage.image;
}
