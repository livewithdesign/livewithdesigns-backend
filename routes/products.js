const express = require('express');
const { protect, admin } = require('../middleware/auth');
const Product = require('../models/Product');
const { uploadToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Product.countDocuments(query);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, category, price, description, color, material, inStock, stock_quantity } = req.body;

    // Create new product
    const product = new Product({
      name,
      category,
      price,
      description,
      color,
      material,
      inStock,
      stock_quantity
    });

    // If there's a file in the request, upload to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'products');
      product.image = result.secure_url;
    }

    const createdProduct = await product.save();
    res.status(201).json({
      success: true,
      data: createdProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, category, price, description, color, material, inStock, stock_quantity } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.name = name || product.name;
    product.category = category || product.category;
    product.price = price || product.price;
    product.description = description || product.description;
    product.color = color || product.color;
    product.material = material || product.material;
    product.inStock = inStock !== undefined ? inStock : product.inStock;
    product.stock_quantity = stock_quantity || product.stock_quantity;
    
    // If there's a file in the request, upload to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'products');
      product.image = result.secure_url;
    }
    
    const updatedProduct = await product.save();
    
    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Product.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;