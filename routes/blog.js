const express = require('express');
const { protect, admin } = require('../middleware/auth');
const Blog = require('../models/Blog');
const { uploadToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// @desc    Fetch all blog posts
// @route   GET /api/blog
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    
    let query = {};
    
    if (category) {
      query.category = category;
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

// @desc    Fetch single blog post by slug
// @route   GET /api/blog/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create new blog post
// @route   POST /api/blog
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { slug, title, excerpt, content, author, category, readTime } = req.body;

    // Create new blog post
    const blog = new Blog({
      slug,
      title,
      excerpt,
      content,
      author,
      category,
      readTime
    });

    // If there's a file in the request, upload to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'blogs');
      blog.image = result.secure_url;
    }

    const createdBlog = await blog.save();
    res.status(201).json({
      success: true,
      data: createdBlog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update blog post
// @route   PUT /api/blog/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { slug, title, excerpt, content, author, category, readTime } = req.body;
    
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    blog.slug = slug || blog.slug;
    blog.title = title || blog.title;
    blog.excerpt = excerpt || blog.excerpt;
    blog.content = content || blog.content;
    blog.author = author || blog.author;
    blog.category = category || blog.category;
    blog.readTime = readTime || blog.readTime;
    
    // If there's a file in the request, upload to Cloudinary
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'blogs');
      blog.image = result.secure_url;
    }
    
    const updatedBlog = await blog.save();
    
    res.json({
      success: true,
      data: updatedBlog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete blog post
// @route   DELETE /api/blog/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    await Blog.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Blog post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Like a blog post
// @route   POST /api/blog/:id/like
// @access  Public
router.post('/:id/like', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    blog.likes += 1;
    await blog.save();
    
    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;