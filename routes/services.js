const express = require('express');
const { protect, admin } = require('../middleware/auth');
const Service = require('../models/Service');
const { uploadToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// @desc    Fetch all services
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    const services = await Service.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ order: 1, createdAt: -1 });
    
    const total = await Service.countDocuments(query);
    
    res.json({
      success: true,
      data: services,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalServices: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Fetch single service
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, value, features, category, order } = req.body;

    // Create new service
    const service = new Service({
      title,
      description,
      value,
      features,
      category,
      order
    });

    // If there's a file in the request, upload to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'services');
      service.image = result.secure_url;
    }

    const createdService = await service.save();
    res.status(201).json({
      success: true,
      data: createdService
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { title, description, value, features, category, order } = req.body;
    
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    service.title = title || service.title;
    service.description = description || service.description;
    service.value = value || service.value;
    service.features = features || service.features;
    service.category = category || service.category;
    service.order = order !== undefined ? order : service.order;
    
    // If there's a file in the request, upload to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'services');
      service.image = result.secure_url;
    }
    
    const updatedService = await service.save();
    
    res.json({
      success: true,
      data: updatedService
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    await Service.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Service removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;