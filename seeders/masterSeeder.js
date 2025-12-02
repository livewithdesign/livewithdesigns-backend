/**
 * MASTER SEEDER - Complete Database Setup
 * Run: node seeders/masterSeeder.js
 * 
 * This seeds:
 * - Users (admin + customers)
 * - Product Categories (10)
 * - Project Categories (6)
 * - Products (30)
 * - Projects (12+)
 * - Reviews
 * - Services (7)
 * - Blogs (5)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import all models
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Project = require('../models/Project');
const Review = require('../models/Review');
const Blog = require('../models/Blog');
const Service = require('../models/Service');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Order = require('../models/Order');
const ContactMessage = require('../models/ContactMessage');

// Helper to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ============ USERS DATA ============
const usersData = [
  { name: 'Admin User', email: 'admin@livewithdesigns.com', password: 'admin123', role: 'admin', phone: '9876543210' },
  { name: 'Test Customer', email: 'customer@test.com', password: 'customer123', role: 'user', phone: '9876543211' },
  { name: 'Rahul Sharma', email: 'rahul@gmail.com', password: 'rahul123', role: 'user', phone: '9876543212' },
  { name: 'Priya Singh', email: 'priya@gmail.com', password: 'priya123', role: 'user', phone: '9876543213' },
  { name: 'Amit Verma', email: 'amit@gmail.com', password: 'amit123', role: 'user', phone: '9876543214' }
];

// ============ PRODUCT CATEGORIES ============
const productCategories = [
  { name: 'Lighting', description: 'Modern and classic lighting solutions including chandeliers, floor lamps, wall sconces', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800', order: 1 },
  { name: 'Sofas', description: 'Luxury sofas and sectionals for your living room', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', order: 2 },
  { name: 'Beds', description: 'Premium beds and bedroom furniture', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800', order: 3 },
  { name: 'Wall Decoration', description: 'Art pieces, mirrors, wall hangings', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=800', order: 4 },
  { name: 'Furniture', description: 'Complete furniture solutions', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800', order: 5 },
  { name: 'Decor Items', description: 'Decorative accessories and accent pieces', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', order: 6 },
  { name: 'Tables', description: 'Coffee, dining, side and console tables', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800', order: 7 },
  { name: 'Chairs', description: 'Accent, dining, office and lounge chairs', image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800', order: 8 },
  { name: 'Storage', description: 'Smart storage solutions and wardrobes', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800', order: 9 },
  { name: 'Outdoor', description: 'Outdoor furniture and garden decor', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800', order: 10 }
];

// ============ PROJECT CATEGORIES ============
const projectCategoriesData = [
  { name: 'Residential Projects', slug: 'residential', description: 'Home interiors, villas, apartments', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', order: 1 },
  { name: 'Commercial Projects', slug: 'commercial', description: 'Offices, retail spaces, showrooms', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', order: 2 },
  { name: 'Office Projects', slug: 'office', description: 'Corporate offices, coworking spaces', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800', order: 3 },
  { name: 'Hospitality Projects', slug: 'hospitality', description: 'Hotels, resorts, restaurants', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', order: 4 },
  { name: 'Retail Projects', slug: 'retail', description: 'Shops, showrooms, restaurants', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800', order: 5 },
  { name: 'Institutional Projects', slug: 'institutional', description: 'Schools, hospitals, public buildings', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800', order: 6 }
];

// ============ SERVICES DATA ============
const servicesData = [
  {
    title: 'Exteriors',
    description: 'New & durable materials with a balanced play of solids and voids. Beautiful façade design that\'s both stunning and weather-resistant for modern curb appeal.',
    value: 'Long life, low maintenance, modern curb appeal',
    features: ['Front elevation redesign', 'Cladding & louvers', 'HPL/metal/stone finishes', 'Long-lasting materials'],
    category: 'exterior',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    order: 1
  },
  {
    title: 'Interiors (End-to-End)',
    description: 'Complete interior solution from flooring to partitions, TV units, modular kitchens, POP cove ceilings, painting, electrical & plumbing — all in one place.',
    value: 'Single vendor coordination, faster timelines, consistent quality',
    features: ['Living & bedroom design', 'Full home renovation', 'MEP coordination', 'All finishes & fit-outs'],
    category: 'interior',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800',
    order: 2
  },
  {
    title: 'Design & Built (Turnkey)',
    description: 'Design, HUDA/DTCP approvals and construction through one coordinated team for seamless turnkey delivery from concept to completion.',
    value: 'Less friction, clear accountability, predictable cost & schedule',
    features: ['Concept-to-GFC drawings', 'Approvals & sanctions', 'Site execution & QA', 'Final handover'],
    category: 'turnkey',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
    order: 3
  },
  {
    title: 'Kitchen & Almira',
    description: 'In-house brands — WOODTOP modular kitchens and WOODROLE wardrobes/vanities. Custom layouts with proper lighting and easy-to-clean materials.',
    value: 'Custom fit, sleek finishes, practical storage solutions',
    features: ['Island, L-shape & Parallel layouts', 'Custom carcass & shutters', 'Premium hardware & countertops', 'Integrated lighting & accessories'],
    category: 'kitchen',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    order: 4
  },
  {
    title: 'Bathrooms',
    description: 'Bright, airy bathrooms with large frosted windows and big mirrors. Design that feels open and spacious rather than claustrophobic.',
    value: 'Airy feel, better hygiene, easy maintenance',
    features: ['Tiling & sanitaryware', 'CP fittings & waterproofing', 'Ventilation & lighting design', 'Easy-to-maintain finishes'],
    category: 'bathroom',
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800',
    order: 5
  },
  {
    title: 'Renovations / Additions',
    description: 'Structural and interior renovations to give old spaces a modern look with upgraded function and value. Interior redo, new staircases, flooring changes, selective structural updates.',
    value: 'Transform old spaces into modern, functional, valuable homes',
    features: ['Space planning refresh', 'Services upgrade', 'Façade touch-ups', 'Modern redesign'],
    category: 'renovation',
    image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800',
    order: 6
  },
  {
    title: 'Urban Design & Master Planning',
    description: 'Strategic urban planning and master planning services for residential communities, commercial districts, and mixed-use developments. Creating sustainable and vibrant spaces.',
    value: 'Future-proof designs, community-focused development',
    features: ['Community planning', 'Mixed-use development', 'Landscape design', 'Sustainable architecture'],
    category: 'urban',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800',
    order: 7
  }
];

// ============ PRODUCTS DATA ============
const productsData = [
  // LIGHTING (3)
  { name: 'Crystal Chandelier Pendant Light', categoryName: 'Lighting', price: 15999, originalPrice: 19999, description: 'Elegant crystal chandelier with modern design. Perfect for living rooms and dining areas.', shortDescription: 'Modern crystal chandelier', color: 'Gold', material: 'Crystal & Metal', stockQuantity: 25, isFeatured: true, tags: ['chandelier', 'crystal', 'luxury'], dimensions: { length: 60, width: 60, height: 80 }, weight: { value: 8 }, thumbnail: 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=600' },
  { name: 'Minimalist Floor Lamp', categoryName: 'Lighting', price: 4999, originalPrice: 5999, description: 'Sleek minimalist floor lamp with adjustable height. LED compatible.', shortDescription: 'Modern adjustable floor lamp', color: 'Black', material: 'Metal & Fabric', stockQuantity: 40, tags: ['floor lamp', 'minimalist'], dimensions: { length: 35, width: 35, height: 165 }, weight: { value: 4 }, thumbnail: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600' },
  { name: 'Industrial Wall Sconce Set', categoryName: 'Lighting', price: 3499, description: 'Set of 2 industrial style wall sconces. Vintage Edison bulb design.', shortDescription: 'Vintage industrial wall lights', color: 'Bronze', material: 'Iron', stockQuantity: 30, tags: ['wall light', 'industrial'], thumbnail: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600' },

  // SOFAS (3)
  { name: 'Luxury L-Shape Sectional Sofa', categoryName: 'Sofas', price: 89999, originalPrice: 110000, description: 'Premium L-shaped sectional sofa with high-density foam cushions. Seats 6 comfortably.', shortDescription: 'Premium 6-seater L-shape sectional', color: 'Beige', material: 'Premium Fabric & Wood', stockQuantity: 8, isFeatured: true, tags: ['sofa', 'sectional', 'luxury'], dimensions: { length: 300, width: 200, height: 85 }, weight: { value: 95 }, thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600' },
  { name: 'Velvet Chesterfield Sofa', categoryName: 'Sofas', price: 55000, originalPrice: 65000, description: 'Classic Chesterfield design with premium velvet upholstery. Deep button tufting.', shortDescription: 'Classic velvet Chesterfield sofa', color: 'Navy Blue', material: 'Velvet & Teak Wood', stockQuantity: 12, isFeatured: true, tags: ['sofa', 'chesterfield', 'velvet'], dimensions: { length: 220, width: 95, height: 80 }, weight: { value: 65 }, thumbnail: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600' },
  { name: 'Modern 2-Seater Loveseat', categoryName: 'Sofas', price: 32000, description: 'Compact 2-seater loveseat perfect for apartments. Clean modern lines.', shortDescription: 'Compact modern loveseat', color: 'Grey', material: 'Linen & Wood', stockQuantity: 18, tags: ['sofa', 'loveseat', 'modern'], dimensions: { length: 150, width: 85, height: 82 }, weight: { value: 40 }, thumbnail: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600' },

  // BEDS (3)
  { name: 'King Size Platform Bed', categoryName: 'Beds', price: 45999, originalPrice: 55000, description: 'Modern platform bed with upholstered headboard. Solid wood frame.', shortDescription: 'Modern king platform bed', color: 'Walnut', material: 'Sheesham Wood & Fabric', stockQuantity: 10, isFeatured: true, tags: ['bed', 'king size', 'platform'], dimensions: { length: 215, width: 195, height: 120 }, weight: { value: 85 }, thumbnail: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600' },
  { name: 'Queen Storage Bed with Hydraulic', categoryName: 'Beds', price: 38999, description: 'Queen bed with hydraulic storage. Lift-up mechanism for easy access.', shortDescription: 'Queen bed with storage', color: 'Brown', material: 'Engineered Wood', stockQuantity: 15, tags: ['bed', 'queen', 'storage'], dimensions: { length: 210, width: 165, height: 100 }, weight: { value: 75 }, thumbnail: 'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=600' },
  { name: 'Luxury Canopy Bed Frame', categoryName: 'Beds', price: 72000, originalPrice: 85000, description: 'Elegant canopy bed with metal frame. Creates a luxurious bedroom statement.', shortDescription: 'Elegant metal canopy bed', color: 'Gold', material: 'Metal & Brass', stockQuantity: 6, isFeatured: true, tags: ['bed', 'canopy', 'luxury'], dimensions: { length: 220, width: 200, height: 230 }, weight: { value: 70 }, thumbnail: 'https://images.unsplash.com/photo-1578898886225-c7c894047899?w=600' },

  // WALL DECORATION (3)
  { name: 'Abstract Canvas Art Set', categoryName: 'Wall Decoration', price: 8999, description: 'Set of 3 abstract canvas prints. Gallery wrapped, ready to hang.', shortDescription: 'Set of 3 abstract canvas prints', color: 'Multi', material: 'Canvas & Wood Frame', stockQuantity: 35, tags: ['art', 'canvas', 'abstract'], dimensions: { length: 60, width: 5, height: 80 }, weight: { value: 3 }, thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600' },
  { name: 'Macrame Wall Hanging', categoryName: 'Wall Decoration', price: 2499, description: 'Handwoven macrame wall hanging. Natural cotton rope on wooden dowel.', shortDescription: 'Handwoven bohemian macrame', color: 'Natural White', material: 'Cotton Rope & Wood', stockQuantity: 50, tags: ['macrame', 'boho', 'handmade'], dimensions: { length: 60, width: 2, height: 90 }, weight: { value: 0.5 }, thumbnail: 'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=600' },
  { name: 'Decorative Mirror Set', categoryName: 'Wall Decoration', price: 6499, description: 'Set of 5 decorative mirrors in various sizes. Gold metal frames.', shortDescription: 'Set of 5 sunburst mirrors', color: 'Gold', material: 'Glass & Metal', stockQuantity: 25, tags: ['mirror', 'decorative', 'gold'], thumbnail: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600' },

  // FURNITURE (3)
  { name: 'TV Entertainment Unit', categoryName: 'Furniture', price: 24999, originalPrice: 29999, description: 'Modern TV unit with ample storage. Fits TVs up to 65 inches.', shortDescription: 'Modern TV unit for 65" TV', color: 'Oak Finish', material: 'Engineered Wood', stockQuantity: 22, isFeatured: true, tags: ['TV unit', 'entertainment', 'storage'], dimensions: { length: 180, width: 45, height: 55 }, weight: { value: 45 }, thumbnail: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600' },
  { name: 'Bookshelf with Ladder', categoryName: 'Furniture', price: 18999, description: 'Industrial style bookshelf with rolling ladder. 5 tiers of storage.', shortDescription: 'Industrial bookshelf with ladder', color: 'Rustic Brown', material: 'Mango Wood & Iron', stockQuantity: 15, tags: ['bookshelf', 'ladder', 'industrial'], dimensions: { length: 120, width: 35, height: 220 }, weight: { value: 55 }, thumbnail: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600' },
  { name: 'Shoe Rack Cabinet', categoryName: 'Furniture', price: 7999, description: 'Space-saving shoe cabinet with flip-down compartments. Stores 24 pairs.', shortDescription: 'Slim shoe cabinet - 24 pairs', color: 'White', material: 'MDF', stockQuantity: 40, tags: ['shoe rack', 'cabinet', 'storage'], dimensions: { length: 80, width: 25, height: 120 }, weight: { value: 20 }, thumbnail: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=600' },

  // DECOR ITEMS (3)
  { name: 'Ceramic Vase Set', categoryName: 'Decor Items', price: 3999, description: 'Set of 3 handcrafted ceramic vases. Matte finish with minimalist design.', shortDescription: 'Set of 3 minimalist ceramic vases', color: 'Terracotta', material: 'Ceramic', stockQuantity: 60, isFeatured: true, tags: ['vase', 'ceramic', 'minimalist'], weight: { value: 2 }, thumbnail: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600' },
  { name: 'Brass Table Clock', categoryName: 'Decor Items', price: 4499, originalPrice: 5499, description: 'Vintage style brass table clock with Roman numerals. Silent mechanism.', shortDescription: 'Vintage brass desk clock', color: 'Antique Brass', material: 'Brass', stockQuantity: 35, tags: ['clock', 'brass', 'vintage'], dimensions: { length: 15, width: 8, height: 20 }, weight: { value: 0.8 }, thumbnail: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600' },
  { name: 'Decorative Buddha Statue', categoryName: 'Decor Items', price: 5999, description: 'Serene Buddha statue in meditation pose. Hand-finished polyresin.', shortDescription: 'Meditation Buddha statue', color: 'Grey Stone', material: 'Polyresin', stockQuantity: 28, tags: ['buddha', 'statue', 'spiritual'], dimensions: { length: 25, width: 20, height: 40 }, weight: { value: 3 }, thumbnail: 'https://images.unsplash.com/photo-1609619385002-f40f1df9b7eb?w=600' },

  // TABLES (3)
  { name: 'Marble Top Coffee Table', categoryName: 'Tables', price: 22999, originalPrice: 27999, description: 'Elegant coffee table with genuine marble top and gold metal base.', shortDescription: 'Marble coffee table with gold base', color: 'White Marble', material: 'Marble & Stainless Steel', stockQuantity: 18, isFeatured: true, tags: ['coffee table', 'marble', 'luxury'], dimensions: { length: 120, width: 60, height: 45 }, weight: { value: 35 }, thumbnail: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=600' },
  { name: 'Nesting Side Tables Set', categoryName: 'Tables', price: 8999, description: 'Set of 3 nesting side tables. Space-saving design.', shortDescription: 'Set of 3 nesting tables', color: 'Natural Wood', material: 'Acacia Wood & Iron', stockQuantity: 25, tags: ['side table', 'nesting', 'set'], weight: { value: 12 }, thumbnail: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=600' },
  { name: '6-Seater Dining Table', categoryName: 'Tables', price: 35999, originalPrice: 42000, description: 'Solid wood dining table with rustic finish. Seats 6 comfortably.', shortDescription: 'Solid wood 6-seater dining table', color: 'Dark Walnut', material: 'Sheesham Wood', stockQuantity: 10, isFeatured: true, tags: ['dining table', '6-seater', 'solid wood'], dimensions: { length: 180, width: 90, height: 76 }, weight: { value: 70 }, thumbnail: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600' },

  // CHAIRS (3)
  { name: 'Ergonomic Office Chair', categoryName: 'Chairs', price: 18999, originalPrice: 24999, description: 'Premium ergonomic office chair with lumbar support. Adjustable everything.', shortDescription: 'Premium ergonomic office chair', color: 'Black', material: 'Mesh & Metal', stockQuantity: 30, isFeatured: true, tags: ['office chair', 'ergonomic', 'adjustable'], dimensions: { length: 65, width: 65, height: 125 }, weight: { value: 18 }, thumbnail: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600' },
  { name: 'Velvet Accent Chair', categoryName: 'Chairs', price: 12999, description: 'Luxurious velvet accent chair with gold metal legs. Curved back design.', shortDescription: 'Velvet accent chair with gold legs', color: 'Emerald Green', material: 'Velvet & Stainless Steel', stockQuantity: 22, tags: ['accent chair', 'velvet', 'luxury'], dimensions: { length: 70, width: 65, height: 85 }, weight: { value: 12 }, thumbnail: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600' },
  { name: 'Rattan Dining Chair Set', categoryName: 'Chairs', price: 15999, description: 'Set of 2 natural rattan dining chairs. Handwoven with solid wood frame.', shortDescription: 'Set of 2 rattan dining chairs', color: 'Natural', material: 'Rattan & Teak Wood', stockQuantity: 20, tags: ['dining chair', 'rattan', 'boho'], dimensions: { length: 55, width: 50, height: 90 }, weight: { value: 8 }, thumbnail: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600' },

  // STORAGE (3)
  { name: 'Wardrobe with Mirror', categoryName: 'Storage', price: 42999, originalPrice: 52000, description: '3-door wardrobe with full-length mirror. Multiple shelves and drawers.', shortDescription: '3-door wardrobe with mirror', color: 'White & Oak', material: 'Engineered Wood', stockQuantity: 12, isFeatured: true, tags: ['wardrobe', 'mirror', 'storage'], dimensions: { length: 150, width: 60, height: 210 }, weight: { value: 95 }, thumbnail: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600' },
  { name: 'Woven Storage Baskets Set', categoryName: 'Storage', price: 2999, description: 'Set of 3 handwoven seagrass baskets. Natural and eco-friendly.', shortDescription: 'Set of 3 seagrass baskets', color: 'Natural', material: 'Seagrass', stockQuantity: 45, tags: ['basket', 'storage', 'natural'], weight: { value: 1.5 }, thumbnail: 'https://images.unsplash.com/photo-1586981267756-8c7c81693ca6?w=600' },
  { name: 'Chest of Drawers', categoryName: 'Storage', price: 19999, description: '5-drawer chest in classic design. Solid wood with soft-close drawers.', shortDescription: '5-drawer wooden chest', color: 'Honey Oak', material: 'Mango Wood', stockQuantity: 16, tags: ['chest', 'drawers', 'bedroom'], dimensions: { length: 90, width: 45, height: 110 }, weight: { value: 50 }, thumbnail: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600' },

  // OUTDOOR (3)
  { name: 'Garden Lounge Set', categoryName: 'Outdoor', price: 65000, originalPrice: 78000, description: '4-piece outdoor lounge set. Weather-resistant cushions. UV and water resistant.', shortDescription: '4-piece outdoor lounge set', color: 'Grey', material: 'Rattan & Aluminum', stockQuantity: 8, isFeatured: true, tags: ['outdoor', 'lounge', 'garden'], weight: { value: 45 }, thumbnail: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600' },
  { name: 'Hanging Swing Chair', categoryName: 'Outdoor', price: 12999, description: 'Comfortable hanging swing chair with stand. Weather-resistant wicker.', shortDescription: 'Hanging egg chair with stand', color: 'Black & White', material: 'PE Rattan & Steel', stockQuantity: 15, tags: ['swing', 'hanging chair', 'outdoor'], dimensions: { length: 105, width: 80, height: 195 }, weight: { value: 30 }, thumbnail: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=600' },
  { name: 'Wooden Planter Box', categoryName: 'Outdoor', price: 3499, description: 'Large wooden planter box with drainage. Treated for outdoor use.', shortDescription: 'Large outdoor wooden planter', color: 'Natural', material: 'Pine Wood', stockQuantity: 35, tags: ['planter', 'garden', 'outdoor'], dimensions: { length: 80, width: 35, height: 40 }, weight: { value: 8 }, thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600' }
];

// ============ PROJECTS DATA ============
const projectsData = [
  // RESIDENTIAL (4)
  {
    title: 'Luxury Villa - Gurgaon',
    categorySlug: 'residential',
    description: 'A stunning 3-bedroom luxury villa featuring modern minimalist interiors with premium finishes. The home showcases an open-plan living concept with floor-to-ceiling windows, marble flooring, and a sophisticated color palette.',
    clientName: 'Sharma Family',
    location: 'DLF Phase IV, Gurgaon',
    city: 'Gurgaon',
    state: 'Haryana',
    projectSize: { value: 8500, unit: 'sqft' },
    duration: { value: 8, unit: 'months' },
    budget: { min: 4000000, max: 4500000, display: '₹45,00,000' },
    designStyle: 'Modern',
    highlights: ['Home theater', 'Gym', 'Swimming pool', 'Rooftop garden', 'Italian marble flooring'],
    images: { thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800' },
    features: { bedrooms: 3, bathrooms: 3, hasModularKitchen: true, hasFalseCeiling: true, hasWardrobes: true },
    materials: [{ name: 'Italian Marble', category: 'Flooring' }, { name: 'German Kitchen', category: 'Kitchen' }],
    status: 'completed',
    isFeatured: true,
    testimonial: { text: 'Absolutely stunning work! Our villa looks like a dream come true.', rating: 5, clientName: 'Mr. Sharma' }
  },
  {
    title: 'Contemporary Apartment - Delhi',
    categorySlug: 'residential',
    description: 'A chic 2-bedroom apartment with contemporary design elements. Features include smart home automation, modular furniture, and a sophisticated color scheme of whites, grays, and gold accents.',
    clientName: 'Mehta Family',
    location: 'South Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    projectSize: { value: 4200, unit: 'sqft' },
    duration: { value: 6, unit: 'months' },
    budget: { min: 2500000, max: 2800000, display: '₹28,00,000' },
    designStyle: 'Contemporary',
    highlights: ['Smart home automation', 'Balcony garden', 'Study area', 'Walk-in closet'],
    images: { thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800' },
    features: { bedrooms: 2, bathrooms: 2, hasModularKitchen: true, hasFalseCeiling: true, hasStudyRoom: true },
    status: 'completed',
    isFeatured: true
  },
  {
    title: 'Traditional Bungalow - Pune',
    categorySlug: 'residential',
    description: 'A beautifully restored traditional bungalow blending classical design with modern comfort. Features ornate wood work, traditional artifacts, and warm earthy tones.',
    clientName: 'Confidential',
    location: 'Koregaon Park, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    projectSize: { value: 6800, unit: 'sqft' },
    duration: { value: 7, unit: 'months' },
    budget: { min: 3200000, max: 3500000, display: '₹35,00,000' },
    designStyle: 'Traditional',
    highlights: ['Courtyard', 'Library', 'Pooja room', 'Terrace garden', 'Teak wood interiors'],
    images: { thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' },
    features: { bedrooms: 4, bathrooms: 3, hasModularKitchen: true, hasPooja: true },
    status: 'completed',
    isFeatured: false
  },
  {
    title: 'Modern Penthouse - Mumbai',
    categorySlug: 'residential',
    description: 'A spectacular penthouse with panoramic city views, featuring a rooftop pool, private terrace, and ultra-modern interiors with the finest materials.',
    clientName: 'Private Client',
    location: 'Worli, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    projectSize: { value: 12000, unit: 'sqft' },
    duration: { value: 10, unit: 'months' },
    budget: { min: 15000000, max: 18000000, display: '₹1.8 Cr' },
    designStyle: 'Luxury',
    highlights: ['Rooftop pool', 'Private elevator', 'Home automation', 'Wine cellar', 'Home theater'],
    images: { thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800' },
    features: { bedrooms: 5, bathrooms: 6, hasModularKitchen: true, hasFalseCeiling: true, hasWardrobes: true, balconies: 3 },
    status: 'completed',
    isFeatured: true
  },

  // COMMERCIAL (2)
  {
    title: 'Corporate Office - Noida',
    categorySlug: 'commercial',
    description: 'A modern corporate office designed for a tech startup. Features open workspaces, collaboration zones, break areas, and executive offices with premium finishes.',
    clientName: 'TechStart Inc.',
    location: 'Sector 62, Noida',
    city: 'Noida',
    state: 'Uttar Pradesh',
    projectSize: { value: 15000, unit: 'sqft' },
    duration: { value: 10, unit: 'months' },
    budget: { min: 7500000, max: 8000000, display: '₹80,00,000' },
    designStyle: 'Contemporary',
    highlights: ['Cafeteria', 'Recreation zone', 'Green walls', '100+ workstations', '6 conference rooms'],
    images: { thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800' },
    status: 'completed',
    isFeatured: true
  },
  {
    title: 'Luxury Retail Showroom - Mumbai',
    categorySlug: 'commercial',
    description: 'An upscale retail showroom for a luxury brand featuring elegant displays, premium lighting, and sophisticated ambiance to showcase high-end products.',
    clientName: 'Luxury Brand Co.',
    location: 'Bandra, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    projectSize: { value: 8000, unit: 'sqft' },
    duration: { value: 5, unit: 'months' },
    budget: { min: 5000000, max: 5500000, display: '₹55,00,000' },
    designStyle: 'Luxury',
    highlights: ['Interactive displays', 'VIP lounge', 'Premium lighting', 'Marble flooring'],
    images: { thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800' },
    status: 'completed',
    isFeatured: false
  },

  // OFFICE (2)
  {
    title: 'Startup Office - Bangalore',
    categorySlug: 'office',
    description: 'A vibrant startup office featuring colorful design, flexible workspaces, gaming zones, and innovative meeting areas designed to inspire creativity and collaboration.',
    clientName: 'InnovateTech',
    location: 'Whitefield, Bangalore',
    city: 'Bangalore',
    state: 'Karnataka',
    projectSize: { value: 12000, unit: 'sqft' },
    duration: { value: 8, unit: 'months' },
    budget: { min: 6000000, max: 6500000, display: '₹65,00,000' },
    designStyle: 'Industrial',
    highlights: ['Gaming zone', 'Sleeping pods', 'Cafeteria', 'Terrace lounge', '80 workstations'],
    images: { thumbnail: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800' },
    status: 'completed',
    isFeatured: true
  },
  {
    title: 'Co-Working Space - Hyderabad',
    categorySlug: 'office',
    description: 'A modern co-working space with hot desks, private offices, meeting rooms, and community areas designed for flexibility and networking.',
    clientName: 'WorkHub Co.',
    location: 'HITEC City, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    projectSize: { value: 20000, unit: 'sqft' },
    duration: { value: 6, unit: 'months' },
    budget: { min: 8000000, max: 9000000, display: '₹90,00,000' },
    designStyle: 'Contemporary',
    highlights: ['200+ seats', 'Private cabins', 'Event space', 'Podcast room', 'Rooftop cafe'],
    images: { thumbnail: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?w=800' },
    status: 'completed',
    isFeatured: false
  },

  // HOSPITALITY (2)
  {
    title: 'Boutique Hotel - Jaipur',
    categorySlug: 'hospitality',
    description: 'A charming boutique hotel with 25 rooms, each uniquely designed. Features traditional Rajasthani elements combined with modern luxury and comfort.',
    clientName: 'Heritage Stays Ltd.',
    location: 'Pink City, Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    projectSize: { value: 25000, unit: 'sqft' },
    duration: { value: 12, unit: 'months' },
    budget: { min: 11000000, max: 12000000, display: '₹1.2 Cr' },
    designStyle: 'Traditional',
    highlights: ['Spa', 'Swimming pool', 'Rooftop bar', 'Rajasthani courtyard', '25 unique rooms'],
    images: { thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800' },
    status: 'completed',
    isFeatured: true
  },
  {
    title: 'Luxury Resort - Goa',
    categorySlug: 'hospitality',
    description: 'A beachfront luxury resort with private villas, infinity pools, and world-class dining experiences amidst tropical landscapes.',
    clientName: 'Paradise Resorts',
    location: 'Candolim, Goa',
    city: 'Goa',
    state: 'Goa',
    projectSize: { value: 50000, unit: 'sqft' },
    duration: { value: 18, unit: 'months' },
    budget: { min: 50000000, max: 60000000, display: '₹6 Cr' },
    designStyle: 'Luxury',
    highlights: ['Private beach', 'Infinity pool', 'Spa & wellness', '40 private villas', 'Multiple restaurants'],
    images: { thumbnail: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800' },
    status: 'ongoing',
    isFeatured: true
  },

  // RETAIL (2)
  {
    title: 'Fine Dining Restaurant - Hyderabad',
    categorySlug: 'retail',
    description: 'An elegant fine dining establishment featuring sophisticated ambiance, open kitchen concept, and carefully designed dining zones for intimate and group dining.',
    clientName: 'Gourmet Experiences',
    location: 'Jubilee Hills, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    projectSize: { value: 6500, unit: 'sqft' },
    duration: { value: 6, unit: 'months' },
    budget: { min: 4000000, max: 4500000, display: '₹45,00,000' },
    designStyle: 'Contemporary',
    highlights: ['Wine cellar', 'Chef\'s counter', 'Private dining room', 'Outdoor seating', '120 seating capacity'],
    images: { thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800' },
    status: 'completed',
    isFeatured: false
  },
  {
    title: 'Fashion Boutique - Delhi',
    categorySlug: 'retail',
    description: 'A high-end fashion boutique with minimalist design, premium display systems, and luxurious fitting rooms for an exclusive shopping experience.',
    clientName: 'Fashion Forward',
    location: 'Khan Market, Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    projectSize: { value: 3500, unit: 'sqft' },
    duration: { value: 4, unit: 'months' },
    budget: { min: 2500000, max: 3000000, display: '₹30,00,000' },
    designStyle: 'Minimalist',
    highlights: ['VIP fitting rooms', 'Runway display', 'Premium lighting', 'Marble flooring'],
    images: { thumbnail: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800' },
    status: 'completed',
    isFeatured: false
  },

  // INSTITUTIONAL (1)
  {
    title: 'International School - Gurgaon',
    categorySlug: 'institutional',
    description: 'A state-of-the-art international school with modern classrooms, science labs, sports facilities, and creative learning spaces.',
    clientName: 'Global Education Trust',
    location: 'Sector 45, Gurgaon',
    city: 'Gurgaon',
    state: 'Haryana',
    projectSize: { value: 80000, unit: 'sqft' },
    duration: { value: 24, unit: 'months' },
    budget: { min: 100000000, max: 120000000, display: '₹12 Cr' },
    designStyle: 'Modern',
    highlights: ['Smart classrooms', 'Science labs', 'Indoor sports complex', 'Auditorium', 'Library'],
    images: { thumbnail: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800' },
    status: 'ongoing',
    isFeatured: true
  }
];

// ============ BLOGS DATA ============
const blogsData = [
  { title: '10 Interior Design Trends for 2025', slug: '10-interior-design-trends-2025', content: 'Discover the hottest interior design trends that will dominate 2025. From sustainable materials to bold colors, find out what\'s in store for home decor enthusiasts. This year brings exciting changes with biophilic design, curved furniture, and maximalist expressions taking center stage.', excerpt: 'Explore the top interior design trends for 2025', category: 'Trends', tags: ['trends', 'design', '2025'], thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800', isPublished: true },
  { title: 'How to Choose the Perfect Sofa', slug: 'how-to-choose-perfect-sofa', content: 'A comprehensive guide to selecting the right sofa for your living room. Learn about different styles, materials, and sizes to make the best choice. Consider factors like room size, usage patterns, fabric durability, and color schemes.', excerpt: 'Guide to selecting the perfect sofa for your home', category: 'Guides', tags: ['sofa', 'furniture', 'buying guide'], thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800', isPublished: true },
  { title: 'Small Space Living: Maximizing Your Apartment', slug: 'small-space-living-tips', content: 'Tips and tricks for making the most of small living spaces. Discover smart storage solutions, multi-functional furniture ideas, and design hacks that make any room feel larger and more organized.', excerpt: 'Make the most of your small apartment with clever design', category: 'Tips', tags: ['small space', 'apartment', 'storage'], thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', isPublished: true },
  { title: 'The Complete Guide to Modular Kitchens', slug: 'complete-guide-modular-kitchens', content: 'Everything you need to know about modular kitchens - from planning and layout options to material choices and budget considerations. Learn about L-shaped, U-shaped, island, and parallel kitchen designs.', excerpt: 'Your ultimate guide to designing a modular kitchen', category: 'Guides', tags: ['kitchen', 'modular', 'design'], thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', isPublished: true },
  { title: 'Sustainable Interior Design: Eco-Friendly Home Decor', slug: 'sustainable-interior-design', content: 'Learn how to create beautiful interiors while being environmentally conscious. Explore sustainable materials, energy-efficient solutions, and eco-friendly decor options that don\'t compromise on style.', excerpt: 'Create beautiful, eco-friendly interiors', category: 'Sustainability', tags: ['sustainable', 'eco-friendly', 'green design'], thumbnail: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', isPublished: true }
];

// ============ MAIN SEEDER FUNCTION ============
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/3elementstudio';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected:', mongoUri);

    // ========== CLEAN DATABASE ==========
    console.log('\n🧹 Cleaning database...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Project.deleteMany({}),
      Review.deleteMany({}),
      Blog.deleteMany({}),
      Service.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Order.deleteMany({}),
      ContactMessage.deleteMany({})
    ]);
    
    // Drop indexes
    try {
      await Product.collection.dropIndexes();
      await Review.collection.dropIndexes();
      await Category.collection.dropIndexes();
      await Project.collection.dropIndexes();
    } catch (e) {}
    
    console.log('✅ Database cleaned!');

    // ========== SEED USERS ==========
    console.log('\n👥 Seeding users...');
    const createdUsers = [];
    for (const userData of usersData) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({ ...userData, password: hashedPassword });
      createdUsers.push(user);
      console.log(`   ✅ ${userData.name} (${userData.role})`);
    }

    // ========== SEED PRODUCT CATEGORIES ==========
    console.log('\n📂 Seeding product categories...');
    const productCategoryMap = {};
    for (const catData of productCategories) {
      const category = await Category.create({
        ...catData,
        slug: generateSlug(catData.name),
        type: 'product',
        isActive: true
      });
      productCategoryMap[catData.name] = category._id;
    }
    console.log(`   ✅ ${productCategories.length} product categories added`);

    // ========== SEED PROJECT CATEGORIES ==========
    console.log('\n📂 Seeding project categories...');
    const projectCategoryMap = {};
    for (const catData of projectCategoriesData) {
      const category = await Category.create({
        ...catData,
        type: 'project',
        isActive: true
      });
      projectCategoryMap[catData.slug] = category._id;
    }
    console.log(`   ✅ ${projectCategoriesData.length} project categories added`);

    // ========== SEED PRODUCTS ==========
    console.log('\n🛍️ Seeding products...');
    const createdProducts = [];
    for (const prodData of productsData) {
      const categoryId = productCategoryMap[prodData.categoryName];
      const product = await Product.create({
        ...prodData,
        slug: generateSlug(prodData.name),
        category: categoryId,
        inStock: true,
        isActive: true,
        rating: 0,
        reviewCount: 0
      });
      createdProducts.push(product);
    }
    console.log(`   ✅ ${createdProducts.length} products added`);

    // ========== SEED PROJECTS ==========
    console.log('\n🏗️ Seeding projects...');
    const createdProjects = [];
    for (const projData of projectsData) {
      const categoryId = projectCategoryMap[projData.categorySlug];
      if (!categoryId) {
        console.log(`   ⚠️ Category not found: ${projData.categorySlug}`);
        continue;
      }
      
      const project = await Project.create({
        ...projData,
        slug: generateSlug(projData.title),
        category: categoryId,
        isActive: true
      });
      createdProjects.push(project);
    }
    console.log(`   ✅ ${createdProjects.length} projects added`);

    // ========== SEED REVIEWS ==========
    console.log('\n⭐ Seeding reviews...');
    const customerUsers = createdUsers.filter(u => u.role === 'user');
    const reviewComments = [
      { rating: 5, title: 'Excellent Quality!', comment: 'Absolutely love this product. The quality exceeded my expectations. Highly recommended!' },
      { rating: 4, title: 'Great Purchase', comment: 'Very good product. Exactly as described. Delivery was on time.' },
      { rating: 5, title: 'Perfect for my home', comment: 'This fits perfectly in my living room. Great design and build quality.' },
      { rating: 4, title: 'Good value for money', comment: 'Happy with my purchase. Good quality at a reasonable price.' },
      { rating: 5, title: 'Amazing!', comment: 'Best purchase I have made. The craftsmanship is outstanding!' }
    ];

    for (let i = 0; i < createdProducts.length; i++) {
      const product = createdProducts[i];
      const numReviews = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numReviews && j < customerUsers.length; j++) {
        const reviewData = reviewComments[(i + j) % reviewComments.length];
        try {
          await Review.create({
            product: product._id,
            user: customerUsers[j]._id,
            ...reviewData,
            isVerifiedPurchase: Math.random() > 0.5,
            isApproved: true,
            isActive: true
          });
        } catch (e) {}
      }
    }
    
    // Recalculate ratings
    for (const product of createdProducts) {
      await Review.calculateAverageRating(product._id);
    }
    console.log('   ✅ Reviews added and ratings calculated');

    // ========== SEED SERVICES ==========
    console.log('\n🔧 Seeding services...');
    for (const serviceData of servicesData) {
      await Service.create(serviceData);
    }
    console.log(`   ✅ ${servicesData.length} services added`);

    // ========== SEED BLOGS ==========
    console.log('\n📝 Seeding blogs...');
    const adminUser = createdUsers.find(u => u.role === 'admin');
    for (const blogData of blogsData) {
      await Blog.create({ ...blogData, author: adminUser._id });
    }
    console.log(`   ✅ ${blogsData.length} blogs added`);

    // ========== UPDATE PROJECT COUNTS ==========
    console.log('\n📊 Updating category counts...');
    for (const [slug, catId] of Object.entries(projectCategoryMap)) {
      const count = await Project.countDocuments({ category: catId });
      await Category.findByIdAndUpdate(catId, { projectCount: count });
    }
    console.log('   ✅ Category counts updated');

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(50));
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log(`👥 Users: ${usersData.length}`);
    console.log(`📂 Product Categories: ${productCategories.length}`);
    console.log(`📂 Project Categories: ${projectCategoriesData.length}`);
    console.log(`🛍️ Products: ${productsData.length}`);
    console.log(`🏗️ Projects: ${createdProjects.length}`);
    console.log(`⭐ Reviews: Added with calculated ratings`);
    console.log(`🔧 Services: ${servicesData.length}`);
    console.log(`📝 Blogs: ${blogsData.length}`);
    console.log('='.repeat(50));
    console.log('\n📌 Login Credentials:');
    console.log('   Admin: admin@livewithdesigns.com / admin123');
    console.log('   Customer: customer@test.com / customer123');
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
