const express = require('express');
const { protect, admin } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount, taxAmount, shippingCost } = req.body;

    // Validate products and quantities
    const processedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      
      // Check stock
      if (product.stock_quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      
      processedItems.push({
        product: item.product,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        variant: item.variant
      });
    }

    const order = new Order({
      user: req.user._id,
      items: processedItems,
      shippingAddress,
      paymentMethod,
      totalAmount,
      taxAmount,
      shippingCost
    });

    const createdOrder = await order.save();
    res.status(201).json({
      success: true,
      data: createdOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.orderStatus !== 'processing') {
      return res.status(400).json({ message: 'Cannot cancel order that is not in processing state' });
    }
    
    order.orderStatus = 'cancelled';
    await order.save();
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Track order
// @route   GET /api/orders/:id/track
// @access  Private
router.get('/:id/track', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({
      success: true,
      data: {
        _id: order._id,
        orderStatus: order.orderStatus,
        estimatedDelivery: order.estimatedDelivery,
        trackingNumber: order.trackingNumber,
        shippingAddress: order.shippingAddress
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/all', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = {};
    if (status) {
      query.orderStatus = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;