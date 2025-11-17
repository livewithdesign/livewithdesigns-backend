const express = require('express');
const { protect } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
      return res.json({
        success: true,
        data: { items: [], total: 0 }
      });
    }
    
    // Calculate total
    let total = 0;
    cart.items.forEach(item => {
      total += item.product.price * item.quantity;
    });
    
    res.json({
      success: true,
      data: { ...cart.toObject(), total }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
router.post('/add', protect, async (req, res) => {
  try {
    const { product: productId, quantity } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check stock
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }
    
    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ product: productId, quantity });
    }
    
    await cart.save();
    await cart.populate('items.product');
    
    // Calculate total
    let total = 0;
    cart.items.forEach(item => {
      total += item.product.price * item.quantity;
    });
    
    res.json({
      success: true,
      data: { ...cart.toObject(), total }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update cart item
// @route   PUT /api/cart/update
// @access  Private
router.put('/update', protect, async (req, res) => {
  try {
    const { product: productId, quantity } = req.body;
    
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      // Check stock
      const product = await Product.findById(productId);
      if (product && product.stock_quantity < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      
      cart.items[itemIndex].quantity = quantity;
    }
    
    await cart.save();
    await cart.populate('items.product');
    
    // Calculate total
    let total = 0;
    cart.items.forEach(item => {
      total += item.product.price * item.quantity;
    });
    
    res.json({
      success: true,
      data: { ...cart.toObject(), total }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => 
      item.product.toString() !== req.params.productId
    );
    
    await cart.save();
    await cart.populate('items.product');
    
    // Calculate total
    let total = 0;
    cart.items.forEach(item => {
      total += item.product.price * item.quantity;
    });
    
    res.json({
      success: true,
      data: { ...cart.toObject(), total }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Clear cart
// @route   POST /api/cart/clear
// @access  Private
router.post('/clear', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;