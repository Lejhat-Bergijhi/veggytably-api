import sharp from "sharp";

// default max size = 200kb
const compressImage = async (
  bufferImage: Buffer,
  MAX_SIZE: number = 200 * 1024
) => {
  // Check if the file size exceeds the maximum size
  if (bufferImage.length > MAX_SIZE) {
    let compressedImage = null;
    let quality = 100; // Initial quality setting

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

  // if the image is smaller than the max size, return the original image
  return bufferImage;
};

export default compressImage;
