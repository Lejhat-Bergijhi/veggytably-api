import { Request, Response } from "express";
import {
  loginMerchant,
  registerMerchant,
  revokeRefreshToken,
  verifyRefreshToken,
} from "../services/authService";
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

async function signUp(req: Request, res: Response) {
  const user = await registerMerchant(req.body);
  const accessToken = createAccessToken({
    id: user.id,
    username: user.username,
    role: "MERCHANT",
  });

  const refreshToken = createRefreshToken({
    id: user.id,
    role: "MERCHANT",
    tokenVersion: user.tokenVersion,
  });

  res.status(201).json({
    data: {
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
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

  const refreshToken = createRefreshToken({
    id: user.id,
    role: "MERCHANT",
    tokenVersion: user.tokenVersion,
  });

  res.status(200).json({
    data: {
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
    },
  });
}

async function logout(req: Request, res: Response) {
  // TODO
  const payload = res.locals.user;
  const { userId } = payload;

  await revokeRefreshToken(userId);

  res.status(200).json({
    message: "Logout success!",
  });
}

async function merchantRefreshToken(req: Request, res: Response) {
  const user = await verifyRefreshToken(req);

  const accessToken = createAccessToken({
    id: user.id,
    username: user.username,
    role: "MERCHANT",
  });

  res.status(200).json({
    data: {
      accessToken: accessToken,
    },
  });
}

export default { getProfile, signUp, login, logout, merchantRefreshToken };
