const express = require('express');
const { protect } = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const router = express.Router();

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('items.product');
    
    if (!wishlist) {
      return res.json({
        success: true,
        data: { items: [] }
      });
    }
    
    res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist/add
// @access  Private
router.post('/add', protect, async (req, res) => {
  try {
    const { product: productId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user._id, items: [] });
    }
    
    // Check if product already exists in wishlist
    const existingItemIndex = wishlist.items.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (existingItemIndex === -1) {
      // Add new item
      wishlist.items.push({ product: productId });
      await wishlist.save();
    }
    
    await wishlist.populate('items.product');
    
    res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    wishlist.items = wishlist.items.filter(item => 
      item.product.toString() !== req.params.productId
    );
    
    await wishlist.save();
    await wishlist.populate('items.product');
    
    res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Move item from wishlist to cart
// @route   POST /api/wishlist/move-to-cart/:productId
// @access  Private
router.post('/move-to-cart/:productId', protect, async (req, res) => {
  try {
    const productId = req.params.productId;
    
    // Remove from wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    const itemIndex = wishlist.items.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }
    
    // Remove from wishlist
    wishlist.items.splice(itemIndex, 1);
    await wishlist.save();
    
    // Add to cart
    const cart = require('./cart'); // This won't work directly, but we can implement the logic
    // Instead, we'll manually add to cart
    const { Cart } = require('../models');
    let userCart = await Cart.findOne({ user: req.user._id });
    if (!userCart) {
      userCart = new Cart({ user: req.user._id, items: [] });
    }
    
    // Check if product already exists in cart
    const existingCartItemIndex = userCart.items.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (existingCartItemIndex > -1) {
      // Update quantity
      userCart.items[existingCartItemIndex].quantity += 1;
    } else {
      // Add new item with quantity 1
      userCart.items.push({ product: productId, quantity: 1 });
    }
    
    await userCart.save();
    
    // Get updated wishlist
    await wishlist.populate('items.product');
    
    res.json({
      success: true,
      message: 'Item moved to cart successfully',
      wishlist: wishlist
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;