import { Request, Response } from "express";
import { loginMerchant, registerMerchant } from "../services/authService";
import { createAccessToken } from "../utils/jwt";

async function signUp(req: Request, res: Response) {
  const result = await registerMerchant(req.body);
  res.status(201).json({
    data: result,
  });
}

async function login(req: Request, res: Response) {
  const user = await loginMerchant(req.body);

  const accessToken = createAccessToken({
    id: user.id,
    username: user.username,
  });

  res.status(200).json({
    data: {
      token: accessToken,
    },
  });
}

export default { signUp, login };
