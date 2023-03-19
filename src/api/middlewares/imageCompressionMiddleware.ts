import sharp from "sharp";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/exceptions/BadRequestError";

// Define the maximum size in bytes
const MAX_SIZE = 1024 * 1024; // 1MB

async function imageCompression(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Check if the request is for an image file
    if (req.file && req.file.buffer && req.file.mimetype.startsWith("image/")) {
      // Read the buffer image file
      const bufferImage = req.file.buffer;

      // Check if the file size exceeds the maximum size
      if (bufferImage.length > MAX_SIZE) {
        let quality = 80; // Initial quality setting
        let compressedImage = null;

        // Adjust the quality setting until the resulting compressed image is below 1 MB
        do {
          compressedImage = await sharp(bufferImage)
            .jpeg({ quality })
            .toBuffer({ resolveWithObject: true });

          // Decrease the quality setting if the size of the compressed image is still too large
          if (compressedImage.info.size > MAX_SIZE) {
            quality -= 10;
          }
        } while (compressedImage.info.size > MAX_SIZE && quality >= 10);

        // Replace the original buffer image file with the compressed one
        req.file.buffer = compressedImage.data;
      }
    }

    next();
  } catch (error) {
    console.error("Error compressing image:", error);
    next();
  }
}

export default imageCompression;
