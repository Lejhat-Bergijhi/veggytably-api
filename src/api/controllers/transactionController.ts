import { Request, Response } from "express";
import { getWalletByUserId } from "../services/walletService";

async function getWallet(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;

  const wallet = await getWalletByUserId(userId);

  res.status(200).json({
    data: {
      wallet: wallet,
    },
  });
}

async function createTransaction(req: Request, res: Response) {}

export default {
  getWallet,
  createTransaction,
};
