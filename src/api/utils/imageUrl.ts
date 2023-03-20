import { Request } from "express";

export function imageIdToUrl(imageId: string | undefined, req: Request) {
  if (!imageId) return null;

  return `${req.protocol}://${req.get(
    "host"
  )}/merchants/menu/images/${imageId}`;
}
