const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng upload một file ảnh' });
    }
    const imageUrl = req.file.path;
    res.status(200).json({
      message: 'Upload ảnh thành công',
      imageUrl: imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

module.exports=router