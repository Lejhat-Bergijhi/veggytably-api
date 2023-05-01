import { Request, Response } from "express";
import { createVoucher, findVouchers } from "../services/cmsService";

async function getVouchers(req: Request, res: Response) {
  const vouchers = await findVouchers();

  res.status(200).json({
    data: {
      vouchers,
    },
  });
}

async function postVoucher(req: Request, res: Response) {
  const success = await createVoucher(req.body);

  res.status(200).json({
    data: {
      message: "Vouchers created successfully!",
      ok: success,
    },
  });
}

export default {
  getVouchers,
  postVoucher,
};
