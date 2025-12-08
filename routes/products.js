const express = require('express');
const multer = require('multer');
const { protect, admin } = require('../middleware/auth');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'), false);
    }
  }
});

// Product categories
const CATEGORIES = [
  'Lighting', 'Sofas', 'Beds', 'Wall Decoration', 
  'Furniture', 'Decor Items', 'Tables', 'Chairs', 
  'Storage', 'Outdoor'
];

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      material,
      inStock,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1, 
      limit = 12 
    } = req.query;
    
    let query = { isActive: true };
    
    // Category filter - use categoryName field
    if (category && category !== 'All') {
      query.categoryName = category;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Material filter
    if (material) {
      query.material = material;
    }
    
    // Stock filter
    if (inStock === 'true') {
      query.inStock = true;
    }
    
    // Featured filter
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }
    
    // Sort options
    let sort = {};
    if (sortBy === 'price-low') {
      sort.price = 1;
    } else if (sortBy === 'price-high') {
      sort.price = -1;
    } else if (sortBy === 'rating') {
      sort.rating = -1;
    } else if (sortBy === 'name') {
      sort.name = 1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }
    
    const products = await Product.find(query)
      .populate('category', 'name slug image')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort(sort);
    
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
    console.error('Error fetching products:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categoryCounts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    const categories = CATEGORIES.map(cat => {
      const found = categoryCounts.find(c => c._id === cat);
      return {
        name: cat,
        count: found ? found.count : 0
      };
    });
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category', 'name slug image')
      .limit(8)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get materials list
// @route   GET /api/products/materials
// @access  Public
router.get('/materials', async (req, res) => {
  try {
    const materials = await Product.distinct('material', { isActive: true, material: { $ne: null } });
    res.json({
      success: true,
      data: materials.filter(m => m)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single product by ID or slug
// @route   GET /api/products/:identifier
// @access  Public
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let product;
    
    // Check if identifier is MongoDB ObjectId
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(identifier).populate('category', 'name slug image');
    } else {
      product = await Product.findOne({ slug: identifier, isActive: true }).populate('category', 'name slug image');
    }
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get related products (same category)
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category._id || product.category,
      isActive: true
    }).populate('category', 'name slug image').limit(4);
    
    res.json({
      success: true,
      data: product,
      relatedProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { 
      name, category, price, originalPrice, description, shortDescription,
      color, material, dimensions, weight, stockQuantity, tags, isFeatured, sku
    } = req.body;

    // Fetch category to get categoryName
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // Create product
    const productData = {
      name,
      category,
      categoryName: categoryDoc.name,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      description,
      shortDescription,
      color,
      material,
      stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
      inStock: stockQuantity > 0,
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      isFeatured: isFeatured === 'true' || isFeatured === true,
      sku
    };
    
    // Parse dimensions if provided
    if (dimensions) {
      productData.dimensions = typeof dimensions === 'string' ? JSON.parse(dimensions) : dimensions;
    }
    
    // Parse weight if provided
    if (weight) {
      productData.weight = typeof weight === 'string' ? JSON.parse(weight) : weight;
    }

    // Upload image if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'livewithdesigns/products');
      productData.thumbnail = result.secure_url;
      productData.images = [{ url: result.secure_url, publicId: result.public_id }];
    }

    const product = await Product.create(productData);
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const updateData = { ...req.body };
    
    // If category is being updated, fetch and set categoryName
    if (updateData.category && updateData.category !== product.category.toString()) {
      const categoryDoc = await Category.findById(updateData.category);
      if (!categoryDoc) {
        return res.status(400).json({ message: 'Invalid category ID' });
      }
      updateData.categoryName = categoryDoc.name;
    }
    
    // Parse JSON fields
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = JSON.parse(updateData.tags);
    }
    if (updateData.dimensions && typeof updateData.dimensions === 'string') {
      updateData.dimensions = JSON.parse(updateData.dimensions);
    }
    if (updateData.weight && typeof updateData.weight === 'string') {
      updateData.weight = JSON.parse(updateData.weight);
    }
    
    // Handle boolean fields
    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;
    }
    if (updateData.isActive !== undefined) {
      updateData.isActive = updateData.isActive === 'true' || updateData.isActive === true;
    }
    
    // Upload new image if provided
    if (req.file) {
      // Delete old image from Cloudinary
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          if (img.publicId) {
            try {
              await deleteFromCloudinary(img.publicId);
            } catch (e) {
              console.error('Error deleting old image:', e);
            }
          }
        }
      }
      
      const result = await uploadToCloudinary(req.file.buffer, 'livewithdesigns/products');
      updateData.thumbnail = result.secure_url;
      updateData.images = [{ url: result.secure_url, publicId: result.public_id }];
    }
    
    // Update stock status
    if (updateData.stockQuantity !== undefined) {
      updateData.inStock = Number(updateData.stockQuantity) > 0;
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
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
    
    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.publicId) {
          try {
            await deleteFromCloudinary(img.publicId);
          } catch (e) {
            console.error('Error deleting image:', e);
          }
        }
      }
    }
    
    await product.deleteOne();
    
    res.json({ 
      success: true,
      message: 'Product deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
