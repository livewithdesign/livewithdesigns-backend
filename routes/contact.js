const express = require('express');
const { protect, admin } = require('../middleware/auth');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, serviceType } = req.body;

    const contactMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message,
      serviceType
    });

    const createdMessage = await contactMessage.save();
    res.status(201).json({
      success: true,
      data: createdMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Fetch all contact messages
// @route   GET /api/contact
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }
    
    const messages = await ContactMessage.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await ContactMessage.countDocuments(query);
    
    res.json({
      success: true,
      data: messages,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Fetch single contact message
// @route   GET /api/contact/:id
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update contact message status
// @route   PUT /api/contact/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    if (status) {
      message.status = status;
    }
    
    const updatedMessage = await message.save();
    
    res.json({
      success: true,
      data: updatedMessage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    await ContactMessage.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Message removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reply to contact message
// @route   POST /api/contact/:id/respond
// @access  Private/Admin
router.post('/:id/respond', protect, admin, async (req, res) => {
  try {
    const { message: responseMessage } = req.body;
    const { id } = req.params;
    
    const message = await ContactMessage.findById(id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    message.responses.push({
      message: responseMessage,
      respondedBy: req.user.name
    });
    message.status = 'replied';
    
    await message.save();
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;