import { Request, Response } from "express";
import { updateCustomerProfile } from "../services/customerService";

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

export default { updateProfile };
