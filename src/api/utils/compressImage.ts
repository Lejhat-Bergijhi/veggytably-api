import sharp from "sharp";

// Define the maximum size in bytes
const MAX_SIZE = 200 * 1024; // 200 kb

async function compressImage(bufferImage: Buffer) {
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

    return compressedImage.data;
  }
}

export default compressImage;
