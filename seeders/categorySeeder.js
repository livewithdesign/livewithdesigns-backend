const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Categories for Products (Store)
const productCategories = [
  {
    name: 'Lighting',
    description: 'Modern and classic lighting solutions including chandeliers, floor lamps, wall sconces, and pendant lights',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
    order: 1
  },
  {
    name: 'Sofas',
    description: 'Luxury sofas and sectionals for your living room, from modern minimalist to classic designs',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    order: 2
  },
  {
    name: 'Beds',
    description: 'Premium beds and bedroom furniture for a perfect night sleep',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
    order: 3
  },
  {
    name: 'Wall Decoration',
    description: 'Art pieces, mirrors, wall hangings and decorative elements for your walls',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=800',
    order: 4
  },
  {
    name: 'Furniture',
    description: 'Complete furniture solutions including cabinets, shelves, and storage units',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
    order: 5
  },
  {
    name: 'Decor Items',
    description: 'Decorative accessories, vases, sculptures, and accent pieces',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    order: 6
  },
  {
    name: 'Tables',
    description: 'Coffee tables, dining tables, side tables, and console tables',
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800',
    order: 7
  },
  {
    name: 'Chairs',
    description: 'Accent chairs, dining chairs, office chairs, and lounge seating',
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
    order: 8
  },
  {
    name: 'Storage',
    description: 'Smart storage solutions, wardrobes, and organizational furniture',
    image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800',
    order: 9
  },
  {
    name: 'Outdoor',
    description: 'Outdoor furniture, garden decor, and patio essentials',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800',
    order: 10
  }
];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/3elementstudio');
    console.log('MongoDB Connected');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Add categories with slugs
    for (const cat of productCategories) {
      await Category.create({
        ...cat,
        slug: generateSlug(cat.name),
        isActive: true,
        projectCount: 0
      });
      console.log(`✅ Added: ${cat.name}`);
    }

    console.log('\n✅ Successfully added 10 categories!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
