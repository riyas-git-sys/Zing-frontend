import cloudinaryPackage from 'cloudinary';
import fs from 'fs';

const cloudinary = cloudinaryPackage.v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      file.path,
      {
        resource_type: 'auto',
        folder: 'rizchat',
      },
      (error, result) => {
        fs.unlinkSync(file.path); // Remove file from local storage
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
  });
};