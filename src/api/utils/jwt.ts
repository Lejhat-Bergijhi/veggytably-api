import { sign } from "jsonwebtoken";

export function createAccessToken({ id, role }) {
  // TODO: input type pls
  return sign({ userId: id, role: role }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "1d",
  });
}

export function createRefreshToken({ id, role, tokenVersion }) {
  // const { _id, role, tokenVersion } = user;
  // TODO handle type validation
  return sign(
    { userId: id, role: role, tokenVersion: tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "15d",
    }
  );
}
