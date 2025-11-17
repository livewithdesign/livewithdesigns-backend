const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('../models/Category');
const connectDB = require('../config/db');

dotenv.config();

const defaultCategories = [
  {
    name: 'Residential',
    description: 'Beautiful residential interior designs for homes, apartments, and villas',
    icon: 'Home',
    order: 1,
    isActive: true
  },
  {
    name: 'Commercial',
    description: 'Modern commercial space designs for businesses and retail',
    icon: 'Building',
    order: 2,
    isActive: true
  },
  {
    name: 'Office',
    description: 'Professional office interior designs for corporate spaces',
    icon: 'Briefcase',
    order: 3,
    isActive: true
  },
  {
    name: 'Hospitality',
    description: 'Elegant designs for hotels, resorts, and restaurants',
    icon: 'Coffee',
    order: 4,
    isActive: true
  },
  {
    name: 'Retail',
    description: 'Attractive retail space designs for shops and showrooms',
    icon: 'ShoppingBag',
    order: 5,
    isActive: true
  },
  {
    name: 'Institutional',
    description: 'Functional designs for schools, hospitals, and public spaces',
    icon: 'School',
    order: 6,
    isActive: true
  }
];

const seedCategories = async () => {
  try {
    await connectDB();

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Existing categories deleted');

    // Insert default categories
    const categories = await Category.insertMany(defaultCategories);
    console.log('Default categories created:', categories.length);

    console.log('\nCategories:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (slug: ${cat.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
