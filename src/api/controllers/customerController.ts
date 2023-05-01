import { Request, Response } from "express";
import {
  deleteCustomerCart,
  getCartUnique,
  getCustomerCart,
  getCustomerVouchersByUserId,
  getTotalPrice,
  labelVoucherEligibility,
  updateCustomerCart,
  updateCustomerProfile,
} from "../services/customerService";

async function updateProfile(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;

  const user = await updateCustomerProfile(userId, req.body);

  const { password, tokenVersion, profilePicture, ...rest } = user;

  res.status(200).json({
    data: {
      user: rest,
    },
  });
}

/**
 * @route    /cart/:merchantId
 * @desc     get, update, delete cart
 * @access   private
 */
async function getCartList(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;

  const cartList = await getCustomerCart(userId);

  res.status(200).json({
    data: {
      cartList,
    },
  });
}

async function getOneCart(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;
  const { merchantId } = req.params;

  const cart = await getCartUnique(userId, merchantId);

  res.status(200).json({
    data: {
      cart,
    },
  });
}

async function updateCart(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;
  const { merchantId } = req.params;

  const { menuId, quantity } = req.body;

  const cartItem = await updateCustomerCart(userId, merchantId, {
    menuId,
    quantity,
  });

  res.status(200).json({
    data: {
      cartItem,
    },
  });
}

async function deleteCart(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;
  const { merchantId } = req.params;

  const cartItem = await deleteCustomerCart(userId, merchantId);

  res.status(200).json({
    data: {
      cartItem,
    },
  });
}

/**
 * @route    /cart/:cartId/vouchers
 * @desc     get vouchers for a cart
 * @access   private
 */
async function getVouchers(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;
  const { cartId } = req.params;

  // get vouchers for a cart
  const vouchers = await getCustomerVouchersByUserId(userId);

  // get cart total
  const totalPrice = await getTotalPrice(cartId);

  // label voucher eligibility for cart
  const cartVouchers = await labelVoucherEligibility(vouchers, cartId);

  res.status(200).json({
    data: {
      total: totalPrice,
      vouchers: cartVouchers,
    },
  });
}

export default {
  updateProfile,
  getCartList,
  getOneCart,
  updateCart,
  deleteCart,
  getVouchers,
};
