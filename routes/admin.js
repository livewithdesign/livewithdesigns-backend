const express = require('express');
const multer = require('multer');
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Project = require('../models/Project');
const Blog = require('../models/Blog');
const Service = require('../models/Service');
const ContactMessage = require('../models/ContactMessage');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @desc    Dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const totalServices = await Service.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    
    // Calculate revenue (example - you might want to refine this)
    const orders = await Order.find({ orderStatus: 'delivered' });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalProjects,
        totalBlogs,
        totalServices,
        totalCategories,
        totalCustomers,
        totalRevenue,
        newOrders: await Order.countDocuments({ orderStatus: 'processing' }),
        pendingOrders: await Order.countDocuments({ orderStatus: 'shipped' })
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const users = await User.find({})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password')
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments();
    
    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, admin, async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await User.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = {};
    if (status) {
      query.orderStatus = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name')
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

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
router.put('/orders/:id', protect, admin, async (req, res) => {
  try {
    const { orderStatus, trackingNumber, estimatedDelivery } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (orderStatus) order.orderStatus = orderStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
    
    await order.save();
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== CATEGORIES ====================

// @desc    Get all categories (including inactive)
// @route   GET /api/admin/categories
// @access  Private/Admin
router.get('/categories', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const categories = await Category.find({})
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ order: 1, name: 1 });
    
    const total = await Category.countDocuments();
    
    res.json({
      success: true,
      data: categories,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalCategories: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
router.post('/categories', protect, admin, async (req, res) => {
  try {
    const { name, description, image, order, isActive } = req.body;

    console.log('Creating category with data:', { name, description, image, order, isActive });

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingCategory) {
      console.log('Category already exists:', existingCategory);
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      description,
      image,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    console.log('Category created successfully:', category);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      message: error.message,
      error: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
router.put('/categories/:id', protect, admin, async (req, res) => {
  try {
    const { name, description, image, isActive, order } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // If image is being updated and old image exists, delete old one from Cloudinary
    if (image && category.image && image !== category.image) {
      try {
        const urlParts = category.image.split('/');
        const publicIdWithExtension = urlParts.slice(-2).join('/');
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, '');
        
        console.log('Deleting old image from Cloudinary:', publicId);
        await deleteFromCloudinary(publicId);
        console.log('Old image deleted successfully');
      } catch (imageError) {
        console.error('Error deleting old image:', imageError);
        // Continue with update even if old image deletion fails
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = order;

    const updatedCategory = await category.save();
    
    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
router.delete('/categories/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has projects
    if (category.projectCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${category.projectCount} existing projects. Please reassign or delete projects first.` 
      });
    }

    // Delete image from Cloudinary if exists
    if (category.image) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = category.image.split('/');
        const publicIdWithExtension = urlParts.slice(-2).join('/'); // folder/filename.ext
        const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, ''); // Remove extension
        
        console.log('Deleting image from Cloudinary:', publicId);
        await deleteFromCloudinary(publicId);
        console.log('Image deleted successfully');
      } catch (imageError) {
        console.error('Error deleting image from Cloudinary:', imageError);
        // Continue with category deletion even if image deletion fails
      }
    }

    await category.deleteOne();
    
    res.json({ 
      success: true,
      message: 'Category deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get category statistics
// @route   GET /api/admin/categories/:id/stats
// @access  Private/Admin
router.get('/categories/:id/stats', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const projects = await Project.find({ category: req.params.id });
    const totalViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = projects.reduce((sum, p) => sum + (p.likes || 0), 0);

    res.json({
      success: true,
      data: {
        categoryName: category.name,
        totalProjects: category.projectCount,
        totalViews,
        totalLikes,
        projects: projects.map(p => ({
          title: p.title,
          slug: p.slug,
          views: p.views,
          likes: p.likes,
          status: p.status
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Upload image
// @route   POST /api/admin/upload
// @access  Private/Admin
router.post('/upload', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Uploading image to Cloudinary...');
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'livewithdesigns/categories');
    
    console.log('Image uploaded successfully:', result.secure_url);

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to upload image',
      error: error.toString()
    });
  }
});

// ==================== PRODUCTS ====================

// @desc    Get all products (admin view)
// @route   GET /api/admin/products
// @access  Private/Admin
router.get('/products', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, inStock } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }
    
    const products = await Product.find(query)
      .populate('category', 'name slug')
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

// @desc    Get single product (admin view)
// @route   GET /api/admin/products/:id
// @access  Private/Admin
router.get('/products/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    
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

// ==================== PROJECTS ====================

// @desc    Get all projects (admin view)
// @route   GET /api/admin/projects
// @access  Private/Admin
router.get('/projects', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    const projects = await Project.find(query)
      .populate('category', 'name slug')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Project.countDocuments(query);
    
    res.json({
      success: true,
      data: projects,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalProjects: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single project (admin view)
// @route   GET /api/admin/projects/:id
// @access  Private/Admin
router.get('/projects/:id', protect, admin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('category', 'name slug');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== BLOGS ====================

// @desc    Get all blogs (admin view)
// @route   GET /api/admin/blogs
// @access  Private/Admin
router.get('/blogs', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const blogs = await Blog.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Blog.countDocuments(query);
    
    res.json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single blog (admin view)
// @route   GET /api/admin/blogs/:id
// @access  Private/Admin
router.get('/blogs/:id', protect, admin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== SERVICES ====================

// @desc    Get all services (admin view)
// @route   GET /api/admin/services
// @access  Private/Admin
router.get('/services', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
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

// @desc    Get single service (admin view)
// @route   GET /api/admin/services/:id
// @access  Private/Admin
router.get('/services/:id', protect, admin, async (req, res) => {
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

// ==================== CONTACT MESSAGES ====================

// @desc    Get all contact messages (admin view)
// @route   GET /api/admin/contacts
// @access  Private/Admin
router.get('/contacts', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
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

// @desc    Get single contact message (admin view)
// @route   GET /api/admin/contacts/:id
// @access  Private/Admin
router.get('/contacts/:id', protect, admin, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Contact message not found' });
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;