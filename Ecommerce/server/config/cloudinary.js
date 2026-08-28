/**
 * ShopEase - Cloudinary Configuration
 * Configures the Cloudinary SDK with environment credentials.
 */

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // always use HTTPS
});

module.exports = cloudinary;
