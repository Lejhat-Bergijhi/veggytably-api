import { Request, Response } from "express";
import {
  createMenu,
  deleteMenuById,
  deleteMenuImageById,
  findMenuByUserId,
  findMenuById,
  findMenuImage,
  getProfileById,
  updateMenu,
  updateProfileById,
  uploadImage,
  findMenuByMerchantId,
} from "../services/merchantService";
import compressImage from "../utils/compressImage";
import { imageIdToUrl } from "../utils/imageUrl";
import {
  binaryStringToBooleanArray,
  decodeRestriction,
} from "../utils/restrictions";

/**
 *  @controller profile
 */
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

/**
 *  @controller public menu query
 *  @desc read only public menu
 */

async function getPublicMenu(req: Request, res: Response) {
  /**
   * @route GET /:merchantId/menu?limit=10&offset=0
   */
  const { merchantId } = req.params;

  const { limit, offset, restrictions } = req.query;

  const decodedRestriction = binaryStringToBooleanArray(restrictions as string);

  const menuList = await findMenuByMerchantId(
    merchantId,
    limit ? Number(limit) : undefined,
    offset ? Number(offset) : undefined,
    decodedRestriction
  );

  // decode restrictions
  const menuListWithDecodedRestrictions = menuList.map((menu) => {
    const decodedRestrictions = decodeRestriction(menu.restrictions);

    const { restrictions, ...rest } = menu;

    return {
      ...rest,
      restrictions: decodedRestrictions,
    };
  });

  res.status(200).json({
    data: {
      menuList: menuListWithDecodedRestrictions,
    },
  });
}

/**
 *  @controller Menu
 *  @desc CRUD menu
 */
async function getManyMenu(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;

  const menuList = await findMenuByUserId(userId);

  // include image url to list
  const menuListWithImageUrl = menuList.map((menu) => {
    const imageUrl = imageIdToUrl(menu.imageId, req);

    // decode restrictions
    const decodedRestrictions = decodeRestriction(menu.restrictions);

    const { restrictions, ...rest } = menu;

    return {
      ...rest,
      restrictions: decodedRestrictions,
      imageUrl: imageUrl,
    };
  });

  res.status(200).json({
    data: {
      menuList: menuListWithImageUrl,
    },
  });
}

async function getOneMenu(req: Request, res: Response) {
  const { menuId } = req.params;

  const menu = await findMenuById(menuId);

  const imageUrl = imageIdToUrl(menu.imageId, req);

  res.status(200).json({
    data: {
      menu: {
        ...menu,
        imageUrl: imageUrl,
      },
    },
  });
}

async function postMenu(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;

  const menu = await createMenu(userId, req.body);

  const imageUrl = imageIdToUrl(menu.imageId, req);

  res.status(201).json({
    data: {
      menu: {
        ...menu,
        imageUrl: imageUrl,
      },
    },
  });
}

async function putMenu(req: Request, res: Response) {
  const { menuId } = req.params;

  const menu = await updateMenu(menuId, req.body);

  const imageUrl = imageIdToUrl(menu.imageId, req);

  res.status(200).json({
    data: {
      menu: {
        ...menu,
        imageUrl: imageUrl,
      },
    },
  });
}

async function deleteMenu(req: Request, res: Response) {
  const { menuId } = req.params;

  await deleteMenuById(menuId);

  res.status(200).json({
    data: {
      message: "Menu deleted!",
    },
  });
}

/**
 *  @controller Menu Image
 *  @desc get, post, delete menu image
 */
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

async function uploadMenuImage(req: Request, res: Response) {
  const { file } = req;

  const menuImage = await uploadImage(file.buffer);

  // create image url
  const imageUrl = imageIdToUrl(menuImage.id, req);

  res.status(200).json({
    data: {
      imageId: menuImage.id,
      imageUrl: imageUrl,
    },
  });
}

async function deleteMenuImage(req: Request, res: Response) {
  const { imageId } = req.params;

  await deleteMenuImageById(imageId);

  res.status(200).json({
    data: {
      message: "Image successfully deleted!",
    },
  });
}

export default {
  getProfile,
  updateProfile,
  getPublicMenu,
  getOneMenu,
  getManyMenu,
  postMenu,
  putMenu,
  deleteMenu,
  getMenuImage,
  uploadMenuImage,
  deleteMenuImage,
};
