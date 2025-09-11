const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// Upload single file
const Upload = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, { resource_type: "image", folder: process.env.CLOUDINARY_FOLDER || "uploads" }, (error, result) => {
      if (error) return reject(error);
      resolve({
        url: result.secure_url || result.url,
        public_id: result.public_id,
      });
    });
  });
};

// Upload multiple files
const UploadMultiple = (filePaths = []) => {
  return Promise.all(filePaths.map((path) => Upload(path)));
};

// Remove single image
const Remove = (public_id) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

// Remove multiple images
const RemoveMultiple = (public_ids = []) => {
  return new Promise((resolve, reject) => {
    cloudinary.api.delete_resources(public_ids, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

// Wrappers for async/await usage
const cloudinaryUpload = async (path) => await Upload(path);
const cloudinaryUploadMultiple = async (paths) => await UploadMultiple(paths);
const cloudinaryRemove = async (public_id) => await Remove(public_id);
const cloudinaryRemoveMultiple = async (public_ids) => await RemoveMultiple(public_ids);

module.exports = {
  cloudinaryUpload,
  cloudinaryUploadMultiple,
  cloudinaryRemove,
  cloudinaryRemoveMultiple,
};
