import cloudinary from "../config/cloudinary.js";

// @desc Upload a single image to Cloudinary
// @route POST /api/admin/upload
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const uploadFromBuffer = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "shopbd/products" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
    const result = await uploadFromBuffer();
    res.status(201).json({
      success: true,
      data: { url: result.secure_url, publicId: result.public_id },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Upload multiple images to Cloudinary (for product gallery)
// @route POST /api/admin/upload-multiple
export const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const uploadFromBuffer = (file) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "shopbd/products" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });

    const results = await Promise.all(req.files.map((file) => uploadFromBuffer(file)));

    res.status(201).json({
      success: true,
      data: results.map((r) => ({ url: r.secure_url, publicId: r.public_id })),
    });
  } catch (error) {
    next(error);
  }
};
