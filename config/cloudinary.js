const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL // Example: 'cloudinary://API_KEY:API_SECRET@CLOUD_NAME'
});

module.exports = cloudinary; 