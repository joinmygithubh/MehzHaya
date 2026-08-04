import cloudinary from "../config/cloudinary.js";

/**
 * Upload an in-memory file buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {string} folder
 */
export const uploadToCloudinary = (buffer, folder = "mehzhaya/products") => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
      return reject(new Error("Cloudinary configuration missing: CLOUDINARY_API_KEY environment variable is not defined."));
    }

    // Re-verify configuration at call time
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ public_id: result.public_id, url: result.secure_url });
      }
    );
    stream.end(buffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    if (!process.env.CLOUDINARY_API_KEY) return;
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete error:", err.message);
  }
};
