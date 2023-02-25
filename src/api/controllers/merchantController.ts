import { Request, Response } from "express";
import { loginMerchant, registerMerchant } from "../services/authService";
import { createAccessToken } from "../utils/jwt";

async function signUp(req: Request, res: Response) {
  const user = await registerMerchant(req.body);
  const accessToken = createAccessToken({
    id: user.id,
    username: user.username,
    role: "MERCHANT",
  });

  res.status(201).json({
    data: {
      user: user,
      token: accessToken,
    },
  });
}

async function login(req: Request, res: Response) {
  const user = await loginMerchant(req.body);
  // TODO create enum for roles
  const accessToken = createAccessToken({
    id: user.id,
    username: user.username,
    role: "MERCHANT",
  });

  res.status(200).json({
    data: {
      user: user,
      token: accessToken,
    },
  });
}

export default { signUp, login };
