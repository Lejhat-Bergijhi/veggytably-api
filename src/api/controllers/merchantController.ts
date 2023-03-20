import { Request, Response } from "express";
import {
  findMenuImage,
  getProfileById,
  updateProfileById,
  uploadImage,
} from "../services/merchantService";
import compressImage from "../utils/compressImage";

async function getProfile(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;

  const merchant = await getProfileById(userId);

  res.status(200).json({
    data: {
      merchant: merchant,
    },
  });
}

async function updateProfile(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;
  const { username, email, phone, restaurantName, restaurantAddress } =
    req.body;

  const merchant = await updateProfileById(
    userId,
    username,
    email,
    phone,
    restaurantName,
    restaurantAddress
  );

  res.status(200).json({
    data: {
      merchant: merchant,
    },
  });
}

async function uploadMenuImage(req: Request, res: Response) {
  const { file } = req;

  const menuImage = await uploadImage(file.buffer);

  // create image url
  const imageUrl = `${req.protocol}://${req.get(
    "host"
  )}/merchants/menu/images/${menuImage.id}`;

  res.status(200).json({
    data: {
      imageUrl: imageUrl,
    },
  });
}

async function getMenuImage(req: Request, res: Response) {
  const { imageId } = req.params;

  const buffer = await findMenuImage(imageId);

  const compressedBuffer = await compressImage(buffer, 10 * 1024);
  console.log(compressedBuffer.length);
  // set content type in headers
  res.set("Content-Type", "image/jpeg");

  // send image
  res.write(compressedBuffer);
  res.end();
}

export default {
  getProfile,
  updateProfile,
  uploadMenuImage,
  getMenuImage,
};
