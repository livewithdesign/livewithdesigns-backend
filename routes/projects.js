const express = require('express');
const { protect, admin } = require('../middleware/auth');
const Project = require('../models/Project');
const Category = require('../models/Category');
const { uploadToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// @desc    Fetch all projects with advanced filtering
// @route   GET /api/projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      location, 
      city,
      state,
      designStyle, 
      minBudget, 
      maxBudget,
      minSize,
      maxSize,
      status,
      isFeatured,
      search,
      page = 1, 
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;
    
    let query = { isActive: true };
    
    // Category filter - can be ID or slug
    if (category) {
      // Check if category is a valid ObjectId
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.category = category;
      } else {
        // Find category by slug
        const categoryDoc = await Category.findOne({ slug: category, type: 'project' });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }
    }
    
    // Location filters
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }
    if (state) {
      query.state = { $regex: state, $options: 'i' };
    }
    
    // Design style filter
    if (designStyle) {
      query.designStyle = designStyle;
    }
    
    // Budget filter
    if (minBudget || maxBudget) {
      query['budget.min'] = {};
      if (minBudget) query['budget.min'].$gte = Number(minBudget);
      if (maxBudget) query['budget.max'].$lte = Number(maxBudget);
    }
    
    // Size filter
    if (minSize || maxSize) {
      query['projectSize.value'] = {};
      if (minSize) query['projectSize.value'].$gte = Number(minSize);
      if (maxSize) query['projectSize.value'].$lte = Number(maxSize);
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    // Featured filter
    if (isFeatured === 'true') {
      query.isFeatured = true;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    
    const projects = await Project.find(query)
      .populate('category', 'name slug')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions);
    
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
      },
      filters: {
        category,
        location,
        city,
        state,
        designStyle,
        minBudget,
        maxBudget,
        minSize,
        maxSize,
        status,
        isFeatured,
        search
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Fetch single project by slug
// @route   GET /api/projects/slug/:slug
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug })
      .populate('category', 'name slug');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Increment views
    project.views += 1;
    await project.save();
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get filter options
// @route   GET /api/projects/filters/options
// @access  Public
router.get('/filters/options', async (req, res) => {
  try {
    const designStyles = await Project.distinct('designStyle');
    const locations = await Project.distinct('location');
    const cities = await Project.distinct('city');
    const states = await Project.distinct('state');
    
    const budgetRange = await Project.aggregate([
      { $match: { 'budget.min': { $exists: true } } },
      {
        $group: {
          _id: null,
          minBudget: { $min: '$budget.min' },
          maxBudget: { $max: '$budget.max' }
        }
      }
    ]);
    
    const sizeRange = await Project.aggregate([
      { $match: { 'projectSize.value': { $exists: true } } },
      {
        $group: {
          _id: null,
          minSize: { $min: '$projectSize.value' },
          maxSize: { $max: '$projectSize.value' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        designStyles: designStyles.filter(Boolean),
        locations: locations.filter(Boolean),
        cities: cities.filter(Boolean),
        states: states.filter(Boolean),
        budgetRange: budgetRange[0] || { minBudget: 0, maxBudget: 0 },
        sizeRange: sizeRange[0] || { minSize: 0, maxSize: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('category', 'name slug');
    
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

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    // Parse nested objects if sent as strings
    const projectData = { ...req.body };
    
    if (typeof projectData.images === 'string') {
      projectData.images = JSON.parse(projectData.images);
    }
    if (typeof projectData.rooms === 'string') {
      projectData.rooms = JSON.parse(projectData.rooms);
    }
    if (typeof projectData.highlights === 'string') {
      projectData.highlights = JSON.parse(projectData.highlights);
    }
    if (typeof projectData.materials === 'string') {
      projectData.materials = JSON.parse(projectData.materials);
    }
    if (typeof projectData.features === 'string') {
      projectData.features = JSON.parse(projectData.features);
    }
    
    const project = await Project.create(projectData);
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    // Parse nested objects if sent as strings
    const updateData = { ...req.body };
    
    if (typeof updateData.images === 'string') {
      updateData.images = JSON.parse(updateData.images);
    }
    if (typeof updateData.rooms === 'string') {
      updateData.rooms = JSON.parse(updateData.rooms);
    }
    if (typeof updateData.highlights === 'string') {
      updateData.highlights = JSON.parse(updateData.highlights);
    }
    if (typeof updateData.materials === 'string') {
      updateData.materials = JSON.parse(updateData.materials);
    }
    if (typeof updateData.features === 'string') {
      updateData.features = JSON.parse(updateData.features);
    }
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    await project.deleteOne();
    
    res.json({ 
      success: true,
      message: 'Project removed' 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Like/Unlike project
// @route   POST /api/projects/:id/like
// @access  Public
router.post('/:id/like', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    project.likes += 1;
    await project.save();
    
    res.json({
      success: true,
      likes: project.likes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;