import { Request, Response } from "express";
import {
  login,
  registerMerchant,
  registerDriver,
  revokeRefreshToken,
  verifyRefreshToken,
} from "../services/authService";
import { createAccessToken, createRefreshToken } from "../utils/jwt";

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

// async function signUpDriver(req: Request, res: Response) {
//   const user = await registerDriver(req.body);
//   const accessToken = createAccessToken({
//     id: user.id,
//     role: user.role,
//   });

//   const refreshToken = createRefreshToken({
//     id: user.id,
//     role: user.role,
//     tokenVersion: user.tokenVersion,
//   });

//   res.status(201).json({
//     data: {
//       user: user,
//       accessToken: accessToken,
//       refreshToken: refreshToken,
//     },
//   });
// }

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

  res.status(200).json({
    data: {
      user: user,
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

export default { signUpMerchant, loginUser, logout, refreshToken };
