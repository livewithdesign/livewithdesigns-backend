const express = require('express');
const { protect } = require('../middleware/auth');
const Address = require('../models/Address');

const router = express.Router();

// @desc    Get all addresses for logged in user
// @route   GET /api/addresses
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id, isActive: true })
      .sort({ isDefault: -1, createdAt: -1 });
    
    res.json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single address
// @route   GET /api/addresses/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }
    
    res.json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      type,
      label,
      fullName,
      phone,
      alternatePhone,
      street,
      landmark,
      city,
      state,
      pincode,
      country,
      isDefault
    } = req.body;

    // Check if this is the first address, make it default
    const addressCount = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = addressCount === 0 ? true : isDefault;

    const address = await Address.create({
      user: req.user._id,
      type: type || 'home',
      label,
      fullName,
      phone,
      alternatePhone,
      street,
      landmark,
      city,
      state,
      pincode,
      country: country || 'India',
      isDefault: shouldBeDefault
    });

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    let address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const updateData = { ...req.body };
    
    // If setting as default, update other addresses
    if (updateData.isDefault) {
      await Address.updateMany(
        { user: req.user._id, _id: { $ne: req.params.id } },
        { isDefault: false }
      );
    }

    address = await Address.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: address
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete address (soft delete)
// @route   DELETE /api/addresses/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Soft delete
    address.isActive = false;
    await address.save();

    // If deleted address was default, set another as default
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ 
        user: req.user._id, 
        isActive: true 
      });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
router.put('/:id/default', protect, async (req, res) => {
  try {
    const address = await Address.findOne({ 
      _id: req.params.id, 
      user: req.user._id,
      isActive: true
    });
    
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Remove default from all other addresses
    await Address.updateMany(
      { user: req.user._id, _id: { $ne: req.params.id } },
      { isDefault: false }
    );

    // Set this as default
    address.isDefault = true;
    await address.save();

    res.json({
      success: true,
      message: 'Default address updated',
      data: address
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
