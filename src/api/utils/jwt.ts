import { sign } from "jsonwebtoken";

export function createAccessToken({ id, username }) {
  // TODO: input type pls
  return sign(
    { userId: id, username: username },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "15d",
    }
  );
}

// export function createRefreshToken(user: User) {
//   const { _id, role, tokenVersion } = user;
//   return sign(
//     { userId: _id, role: role, tokenVersion: tokenVersion },
//     process.env.REFRESH_TOKEN_SECRET!,
//     {
//       expiresIn: "7d",
//     }
//   );
// }
