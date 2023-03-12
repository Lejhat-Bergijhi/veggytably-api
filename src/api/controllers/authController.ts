import { Request, Response } from "express";
import {
  login,
  registerMerchant,
  registerDriver,
  registerCustomer,
  revokeRefreshToken,
  verifyRefreshToken,
  storeProfilePicture,
  getProfilePicture,
  verifyCredentials,
} from "../services/authService";
import { createAccessToken, createRefreshToken } from "../utils/jwt";
import compressImage from "../utils/compressImage";

async function signUpMerchant(req: Request, res: Response) {
  const user = await registerMerchant(req.body);
  const accessToken = createAccessToken({
    id: user.id,
    role: user.role,
  });

  const refreshToken = createRefreshToken({
    id: user.id,
    role: user.role,
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

async function signUpDriver(req: Request, res: Response) {
  const user = await registerDriver(req.body);
  const accessToken = createAccessToken({
    id: user.id,
    role: user.role,
  });

  const refreshToken = createRefreshToken({
    id: user.id,
    role: user.role,
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

async function signUpCustomer(req: Request, res: Response) {
  const user = await registerCustomer(req.body);
  const accessToken = createAccessToken({
    id: user.id,
    role: user.role,
  });

  const refreshToken = createRefreshToken({
    id: user.id,
    role: user.role,
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

async function loginUser(req: Request, res: Response) {
  const user = await login(req.body);
  const accessToken = createAccessToken({
    id: user.id,
    role: user.role,
  });

  const refreshToken = createRefreshToken({
    id: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });

  const { password, profilePicture, ...rest } = user;

  res.status(200).json({
    data: {
      user: rest,
      accessToken: accessToken,
      refreshToken: refreshToken,
    },
  });
}

async function logout(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;

  await revokeRefreshToken(userId);

  res.status(200).json({
    message: "Logout success!",
  });
}

async function verifyAuth(req: Request, res: Response) {
  const payload = res.locals.user;

  const { userId } = payload;

  const user = await verifyCredentials(userId);

  const { password, tokenVersion, profilePicture, ...rest } = user;

  res.status(200).json({
    data: {
      user: rest,
    },
  });
}

async function refreshToken(req: Request, res: Response) {
  const user = await verifyRefreshToken(req);

  const accessToken = createAccessToken({
    id: user.id,
    role: user.role,
  });

  res.status(200).json({
    data: {
      accessToken: accessToken,
    },
  });
}

async function uploadProfilePicture(req: Request, res: Response) {
  const { buffer } = req.file;
  const payload = res.locals.user;

  const { userId } = payload;
  storeProfilePicture(buffer, userId);

  const compressedBuffer = await compressImage(buffer);

  res.status(200).json({
    message: "Upload success!",
    data: {
      profilePicture: compressedBuffer.toString("base64"),
    },
  });
}

async function fetchProfilePicture(req: Request, res: Response) {
  const payload = res.locals.user;

  const { userId } = payload;
  const profilePicture = await getProfilePicture(userId);

  const compressedBuffer = await compressImage(profilePicture);

  res.status(200).json({
    data: {
      isFound: profilePicture ? true : false,
      profilePicture: compressedBuffer.toString("base64"),
    },
  });
}

export default {
  signUpMerchant,
  signUpDriver,
  signUpCustomer,
  loginUser,
  logout,
  refreshToken,
  verifyAuth,
  uploadProfilePicture,
  fetchProfilePicture,
};
