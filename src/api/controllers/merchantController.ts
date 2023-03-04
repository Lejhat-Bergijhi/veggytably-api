import { Request, Response } from "express";
import { createAccessToken, createRefreshToken } from "../utils/jwt";
import { getProfileById } from "../services/merchantService";

async function getProfile(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;

  const user = await getProfileById(userId);

  res.status(200).json({
    data: {
      user: user,
    },
  });
}

export default { getProfile };
