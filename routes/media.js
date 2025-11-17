const express = require('express');
const { protect, admin } = require('../middleware/auth');
const Media = require('../models/Media');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// @desc    Fetch all media
// @route   GET /api/media
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    const media = await Media.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Media.countDocuments(query);
    
    res.json({
      success: true,
      data: media,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalMedia: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Upload new media
// @route   POST /api/media
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { title, description, type, category } = req.body;

    // Upload to Cloudinary first
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, 'media');
    
    const media = new Media({
      title,
      description,
      type,
      category,
      thumbnail: cloudinaryResult.secure_url,
      url: cloudinaryResult.secure_url
    });

    const createdMedia = await media.save();
    res.status(201).json({
      success: true,
      data: createdMedia
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete media
// @route   DELETE /api/media/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    // Delete from Cloudinary
    // Extract public ID from the URL (this is a simplified approach)
    // In a real implementation, you'd store the public_id from Cloudinary
    if (media.url) {
      const urlParts = media.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const publicId = fileName.split('.')[0];
      
      await deleteFromCloudinary(`media/${publicId}`);
    }
    
    await Media.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Media removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Like media
// @route   POST /api/media/:id/like
// @access  Public
router.post('/:id/like', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }
    
    media.likes += 1;
    await media.save();
    
    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;