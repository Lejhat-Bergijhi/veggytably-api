import sharp from "sharp";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/exceptions/BadRequestError";

// Define the maximum size in bytes
const MAX_SIZE = 1024 * 1024; // 1MB

async function isImageFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.file && req.file.buffer && req.file.mimetype.startsWith("image/")) {
      // Check if the request is for an image file
      sharp(req.file.buffer);
    } else {
      throw new Error();
    }

    next();
  } catch (error) {
    throw new BadRequestError("File is not an image!");
  }
}

export default isImageFile;
