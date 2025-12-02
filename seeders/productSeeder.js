const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/3elementstudio');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Store category map (name -> id)
let categoryMap = {};

// Sample Products Data
const sampleProducts = [
  // LIGHTING
  {
    name: 'Crystal Chandelier Pendant Light',
    category: 'Lighting',
    price: 15999,
    originalPrice: 19999,
    description: 'Elegant crystal chandelier with modern design. Perfect for living rooms and dining areas. Features premium quality crystals that create beautiful light reflections.',
    shortDescription: 'Modern crystal chandelier for elegant interiors',
    color: 'Gold',
    material: 'Crystal & Metal',
    inStock: true,
    stockQuantity: 25,
    isFeatured: true,
    tags: ['chandelier', 'crystal', 'luxury', 'pendant'],
    dimensions: { length: 60, width: 60, height: 80, unit: 'cm' },
    weight: { value: 8, unit: 'kg' },
    rating: 4.5,
    reviewCount: 28
  },
  {
    name: 'Minimalist Floor Lamp',
    category: 'Lighting',
    price: 4999,
    originalPrice: 5999,
    description: 'Sleek minimalist floor lamp with adjustable height. LED compatible and energy efficient. Perfect for reading corners and bedrooms.',
    shortDescription: 'Modern adjustable floor lamp',
    color: 'Black',
    material: 'Metal & Fabric',
    inStock: true,
    stockQuantity: 40,
    isFeatured: false,
    tags: ['floor lamp', 'minimalist', 'modern'],
    dimensions: { length: 35, width: 35, height: 165, unit: 'cm' },
    weight: { value: 4, unit: 'kg' },
    rating: 4.2,
    reviewCount: 45
  },
  {
    name: 'Industrial Wall Sconce Set',
    category: 'Lighting',
    price: 3499,
    description: 'Set of 2 industrial style wall sconces. Vintage Edison bulb design. Perfect for hallways and accent lighting.',
    shortDescription: 'Vintage industrial wall lights (Set of 2)',
    color: 'Bronze',
    material: 'Iron',
    inStock: true,
    stockQuantity: 30,
    tags: ['wall light', 'industrial', 'vintage'],
    rating: 4.0,
    reviewCount: 19
  },

  // SOFAS
  {
    name: 'Luxury L-Shape Sectional Sofa',
    category: 'Sofas',
    price: 89999,
    originalPrice: 110000,
    description: 'Premium L-shaped sectional sofa with high-density foam cushions. Features stain-resistant fabric and solid wood frame. Seats 6 comfortably.',
    shortDescription: 'Premium 6-seater L-shape sectional',
    color: 'Beige',
    material: 'Premium Fabric & Wood',
    inStock: true,
    stockQuantity: 8,
    isFeatured: true,
    tags: ['sofa', 'sectional', 'luxury', 'L-shape'],
    dimensions: { length: 300, width: 200, height: 85, unit: 'cm' },
    weight: { value: 95, unit: 'kg' },
    rating: 4.8,
    reviewCount: 56
  },
  {
    name: 'Velvet 3-Seater Chesterfield Sofa',
    category: 'Sofas',
    price: 55000,
    originalPrice: 65000,
    description: 'Classic Chesterfield design with premium velvet upholstery. Deep button tufting and rolled arms. Timeless elegance for your living room.',
    shortDescription: 'Classic velvet Chesterfield sofa',
    color: 'Navy Blue',
    material: 'Velvet & Teak Wood',
    inStock: true,
    stockQuantity: 12,
    isFeatured: true,
    tags: ['chesterfield', 'velvet', 'classic', '3-seater'],
    dimensions: { length: 220, width: 95, height: 75, unit: 'cm' },
    weight: { value: 65, unit: 'kg' },
    rating: 4.7,
    reviewCount: 34
  },
  {
    name: 'Modern 2-Seater Loveseat',
    category: 'Sofas',
    price: 28999,
    description: 'Compact modern loveseat perfect for apartments. Features clean lines and comfortable cushioning.',
    shortDescription: 'Compact modern 2-seater sofa',
    color: 'Grey',
    material: 'Linen & Wood',
    inStock: true,
    stockQuantity: 20,
    tags: ['loveseat', '2-seater', 'compact', 'modern'],
    dimensions: { length: 150, width: 85, height: 80, unit: 'cm' },
    weight: { value: 40, unit: 'kg' },
    rating: 4.3,
    reviewCount: 22
  },

  // BEDS
  {
    name: 'King Size Platform Bed with Storage',
    category: 'Beds',
    price: 45999,
    originalPrice: 55000,
    description: 'Modern platform bed with built-in storage drawers. Solid wood construction with upholstered headboard. Includes slat support system.',
    shortDescription: 'King bed with storage drawers',
    color: 'Walnut Brown',
    material: 'Sheesham Wood & Fabric',
    inStock: true,
    stockQuantity: 15,
    isFeatured: true,
    tags: ['bed', 'king size', 'storage', 'platform'],
    dimensions: { length: 210, width: 195, height: 120, unit: 'cm' },
    weight: { value: 85, unit: 'kg' },
    rating: 4.6,
    reviewCount: 67
  },
  {
    name: 'Queen Upholstered Bed Frame',
    category: 'Beds',
    price: 32999,
    description: 'Elegant upholstered bed frame with tufted headboard. Queen size with sturdy wooden slats included.',
    shortDescription: 'Queen bed with tufted headboard',
    color: 'Cream',
    material: 'Velvet & Pine Wood',
    inStock: true,
    stockQuantity: 18,
    tags: ['bed', 'queen', 'upholstered', 'tufted'],
    dimensions: { length: 200, width: 160, height: 130, unit: 'cm' },
    weight: { value: 55, unit: 'kg' },
    rating: 4.4,
    reviewCount: 41
  },
  {
    name: 'Wooden Four Poster Bed',
    category: 'Beds',
    price: 75000,
    originalPrice: 90000,
    description: 'Handcrafted four poster bed in solid teak wood. Traditional design with modern comfort. A statement piece for master bedrooms.',
    shortDescription: 'Traditional teak four poster bed',
    color: 'Natural Teak',
    material: 'Solid Teak Wood',
    inStock: true,
    stockQuantity: 5,
    isFeatured: true,
    tags: ['four poster', 'traditional', 'teak', 'handcrafted'],
    dimensions: { length: 215, width: 185, height: 200, unit: 'cm' },
    weight: { value: 120, unit: 'kg' },
    rating: 4.9,
    reviewCount: 23
  },

  // WALL DECORATION
  {
    name: 'Abstract Metal Wall Art Set',
    category: 'Wall Decoration',
    price: 8999,
    originalPrice: 11999,
    description: 'Set of 3 abstract metal wall art pieces. Hand-finished with gold and black tones. Modern art for contemporary homes.',
    shortDescription: 'Set of 3 abstract metal wall pieces',
    color: 'Gold & Black',
    material: 'Iron',
    inStock: true,
    stockQuantity: 35,
    isFeatured: true,
    tags: ['wall art', 'metal', 'abstract', 'modern'],
    dimensions: { length: 90, width: 5, height: 60, unit: 'cm' },
    weight: { value: 3, unit: 'kg' },
    rating: 4.5,
    reviewCount: 52
  },
  {
    name: 'Macrame Wall Hanging',
    category: 'Wall Decoration',
    price: 2499,
    description: 'Handwoven macrame wall hanging with bohemian design. Natural cotton rope on wooden dowel. Adds texture and warmth to any room.',
    shortDescription: 'Handwoven bohemian macrame',
    color: 'Natural White',
    material: 'Cotton Rope & Wood',
    inStock: true,
    stockQuantity: 50,
    tags: ['macrame', 'boho', 'handmade', 'textile'],
    dimensions: { length: 60, width: 2, height: 90, unit: 'cm' },
    weight: { value: 0.5, unit: 'kg' },
    rating: 4.3,
    reviewCount: 38
  },
  {
    name: 'Decorative Mirror Set',
    category: 'Wall Decoration',
    price: 6499,
    description: 'Set of 5 decorative mirrors in various sizes. Gold metal frames with sunburst design. Creates beautiful light reflections.',
    shortDescription: 'Set of 5 sunburst mirrors',
    color: 'Gold',
    material: 'Glass & Metal',
    inStock: true,
    stockQuantity: 25,
    isFeatured: false,
    tags: ['mirror', 'sunburst', 'decorative', 'gold'],
    rating: 4.4,
    reviewCount: 29
  },

  // FURNITURE
  {
    name: 'TV Entertainment Unit',
    category: 'Furniture',
    price: 24999,
    originalPrice: 29999,
    description: 'Modern TV unit with ample storage. Features cable management system and soft-close drawers. Fits TVs up to 65 inches.',
    shortDescription: 'Modern TV unit for 65" TV',
    color: 'Oak Finish',
    material: 'Engineered Wood',
    inStock: true,
    stockQuantity: 22,
    isFeatured: true,
    tags: ['TV unit', 'entertainment', 'storage', 'modern'],
    dimensions: { length: 180, width: 45, height: 55, unit: 'cm' },
    weight: { value: 45, unit: 'kg' },
    rating: 4.5,
    reviewCount: 48
  },
  {
    name: 'Bookshelf with Ladder',
    category: 'Furniture',
    price: 18999,
    description: 'Industrial style bookshelf with rolling ladder. 5 tiers of storage with metal frame and wooden shelves.',
    shortDescription: 'Industrial bookshelf with ladder',
    color: 'Rustic Brown',
    material: 'Mango Wood & Iron',
    inStock: true,
    stockQuantity: 15,
    tags: ['bookshelf', 'ladder', 'industrial', 'storage'],
    dimensions: { length: 120, width: 35, height: 220, unit: 'cm' },
    weight: { value: 55, unit: 'kg' },
    rating: 4.6,
    reviewCount: 31
  },
  {
    name: 'Shoe Rack Cabinet',
    category: 'Furniture',
    price: 7999,
    description: 'Space-saving shoe cabinet with flip-down compartments. Stores up to 24 pairs. Slim design perfect for entryways.',
    shortDescription: 'Slim shoe cabinet - 24 pairs',
    color: 'White',
    material: 'MDF',
    inStock: true,
    stockQuantity: 40,
    tags: ['shoe rack', 'cabinet', 'storage', 'entryway'],
    dimensions: { length: 80, width: 25, height: 120, unit: 'cm' },
    weight: { value: 20, unit: 'kg' },
    rating: 4.1,
    reviewCount: 55
  },

  // DECOR ITEMS
  {
    name: 'Ceramic Vase Set',
    category: 'Decor Items',
    price: 3999,
    description: 'Set of 3 handcrafted ceramic vases in varying sizes. Matte finish with minimalist design. Perfect for dried flowers or as standalone decor.',
    shortDescription: 'Set of 3 minimalist ceramic vases',
    color: 'Terracotta',
    material: 'Ceramic',
    inStock: true,
    stockQuantity: 60,
    isFeatured: true,
    tags: ['vase', 'ceramic', 'minimalist', 'handcrafted'],
    weight: { value: 2, unit: 'kg' },
    rating: 4.4,
    reviewCount: 42
  },
  {
    name: 'Brass Table Clock',
    category: 'Decor Items',
    price: 4499,
    originalPrice: 5499,
    description: 'Vintage style brass table clock with Roman numerals. Silent mechanism. Adds classic charm to any desk or shelf.',
    shortDescription: 'Vintage brass desk clock',
    color: 'Antique Brass',
    material: 'Brass',
    inStock: true,
    stockQuantity: 35,
    tags: ['clock', 'brass', 'vintage', 'desk'],
    dimensions: { length: 15, width: 8, height: 20, unit: 'cm' },
    weight: { value: 0.8, unit: 'kg' },
    rating: 4.3,
    reviewCount: 27
  },
  {
    name: 'Decorative Buddha Statue',
    category: 'Decor Items',
    price: 5999,
    description: 'Serene Buddha statue in meditation pose. Hand-finished polyresin with antique stone effect. Brings peace and tranquility to any space.',
    shortDescription: 'Meditation Buddha statue',
    color: 'Grey Stone',
    material: 'Polyresin',
    inStock: true,
    stockQuantity: 28,
    tags: ['buddha', 'statue', 'meditation', 'spiritual'],
    dimensions: { length: 25, width: 20, height: 40, unit: 'cm' },
    weight: { value: 3, unit: 'kg' },
    rating: 4.7,
    reviewCount: 36
  },

  // TABLES
  {
    name: 'Marble Top Coffee Table',
    category: 'Tables',
    price: 22999,
    originalPrice: 27999,
    description: 'Elegant coffee table with genuine marble top and gold metal base. Statement piece for modern living rooms.',
    shortDescription: 'Marble coffee table with gold base',
    color: 'White Marble',
    material: 'Marble & Stainless Steel',
    inStock: true,
    stockQuantity: 18,
    isFeatured: true,
    tags: ['coffee table', 'marble', 'gold', 'luxury'],
    dimensions: { length: 120, width: 60, height: 45, unit: 'cm' },
    weight: { value: 35, unit: 'kg' },
    rating: 4.8,
    reviewCount: 44
  },
  {
    name: 'Nesting Side Tables Set',
    category: 'Tables',
    price: 8999,
    description: 'Set of 3 nesting side tables with wooden tops and metal legs. Space-saving design. Can be used together or separately.',
    shortDescription: 'Set of 3 nesting tables',
    color: 'Natural Wood',
    material: 'Acacia Wood & Iron',
    inStock: true,
    stockQuantity: 25,
    tags: ['side table', 'nesting', 'wood', 'set'],
    weight: { value: 12, unit: 'kg' },
    rating: 4.4,
    reviewCount: 33
  },
  {
    name: '6-Seater Dining Table',
    category: 'Tables',
    price: 35999,
    originalPrice: 42000,
    description: 'Solid wood dining table with rustic finish. Seats 6 comfortably. Sturdy construction built to last generations.',
    shortDescription: 'Solid wood 6-seater dining table',
    color: 'Dark Walnut',
    material: 'Sheesham Wood',
    inStock: true,
    stockQuantity: 10,
    isFeatured: true,
    tags: ['dining table', '6-seater', 'solid wood', 'rustic'],
    dimensions: { length: 180, width: 90, height: 76, unit: 'cm' },
    weight: { value: 70, unit: 'kg' },
    rating: 4.7,
    reviewCount: 51
  },

  // CHAIRS
  {
    name: 'Ergonomic Office Chair',
    category: 'Chairs',
    price: 18999,
    originalPrice: 24999,
    description: 'Premium ergonomic office chair with lumbar support. Adjustable height, armrests, and headrest. Breathable mesh back.',
    shortDescription: 'Premium ergonomic office chair',
    color: 'Black',
    material: 'Mesh & Metal',
    inStock: true,
    stockQuantity: 30,
    isFeatured: true,
    tags: ['office chair', 'ergonomic', 'adjustable', 'mesh'],
    dimensions: { length: 65, width: 65, height: 125, unit: 'cm' },
    weight: { value: 18, unit: 'kg' },
    rating: 4.6,
    reviewCount: 89
  },
  {
    name: 'Velvet Accent Chair',
    category: 'Chairs',
    price: 12999,
    description: 'Luxurious velvet accent chair with gold metal legs. Curved back design provides excellent comfort and style.',
    shortDescription: 'Velvet accent chair with gold legs',
    color: 'Emerald Green',
    material: 'Velvet & Stainless Steel',
    inStock: true,
    stockQuantity: 22,
    tags: ['accent chair', 'velvet', 'gold legs', 'luxury'],
    dimensions: { length: 70, width: 65, height: 85, unit: 'cm' },
    weight: { value: 12, unit: 'kg' },
    rating: 4.5,
    reviewCount: 37
  },
  {
    name: 'Rattan Dining Chair Set',
    category: 'Chairs',
    price: 15999,
    description: 'Set of 2 natural rattan dining chairs. Handwoven with solid wood frame. Perfect for bohemian and coastal interiors.',
    shortDescription: 'Set of 2 rattan dining chairs',
    color: 'Natural',
    material: 'Rattan & Teak Wood',
    inStock: true,
    stockQuantity: 20,
    tags: ['dining chair', 'rattan', 'boho', 'set of 2'],
    dimensions: { length: 55, width: 50, height: 90, unit: 'cm' },
    weight: { value: 8, unit: 'kg' },
    rating: 4.4,
    reviewCount: 28
  },

  // STORAGE
  {
    name: 'Wardrobe with Mirror',
    category: 'Storage',
    price: 42999,
    originalPrice: 52000,
    description: '3-door wardrobe with full-length mirror. Multiple shelves, hanging rods, and drawers. Ample storage for all your clothes.',
    shortDescription: '3-door wardrobe with mirror',
    color: 'White & Oak',
    material: 'Engineered Wood',
    inStock: true,
    stockQuantity: 12,
    isFeatured: true,
    tags: ['wardrobe', 'mirror', 'storage', '3-door'],
    dimensions: { length: 150, width: 60, height: 210, unit: 'cm' },
    weight: { value: 95, unit: 'kg' },
    rating: 4.5,
    reviewCount: 62
  },
  {
    name: 'Woven Storage Baskets Set',
    category: 'Storage',
    price: 2999,
    description: 'Set of 3 handwoven seagrass baskets. Perfect for organizing blankets, toys, or laundry. Natural and eco-friendly.',
    shortDescription: 'Set of 3 seagrass baskets',
    color: 'Natural',
    material: 'Seagrass',
    inStock: true,
    stockQuantity: 45,
    tags: ['basket', 'storage', 'natural', 'handwoven'],
    weight: { value: 1.5, unit: 'kg' },
    rating: 4.3,
    reviewCount: 47
  },
  {
    name: 'Chest of Drawers',
    category: 'Storage',
    price: 19999,
    description: '5-drawer chest in classic design. Solid wood with soft-close drawers. Ideal for bedroom or living room storage.',
    shortDescription: '5-drawer wooden chest',
    color: 'Honey Oak',
    material: 'Mango Wood',
    inStock: true,
    stockQuantity: 16,
    tags: ['chest', 'drawers', 'bedroom', 'wood'],
    dimensions: { length: 90, width: 45, height: 110, unit: 'cm' },
    weight: { value: 50, unit: 'kg' },
    rating: 4.6,
    reviewCount: 39
  },

  // OUTDOOR
  {
    name: 'Garden Lounge Set',
    category: 'Outdoor',
    price: 65000,
    originalPrice: 78000,
    description: '4-piece outdoor lounge set with weather-resistant cushions. Includes 2 chairs, 1 loveseat, and 1 coffee table. UV and water resistant.',
    shortDescription: '4-piece outdoor lounge set',
    color: 'Grey',
    material: 'Rattan & Aluminum',
    inStock: true,
    stockQuantity: 8,
    isFeatured: true,
    tags: ['outdoor', 'lounge', 'garden', 'patio'],
    weight: { value: 45, unit: 'kg' },
    rating: 4.7,
    reviewCount: 34
  },
  {
    name: 'Hanging Swing Chair',
    category: 'Outdoor',
    price: 12999,
    description: 'Comfortable hanging swing chair with stand. Weather-resistant wicker with plush cushion. Perfect for balconies and gardens.',
    shortDescription: 'Hanging egg chair with stand',
    color: 'Black & White',
    material: 'PE Rattan & Steel',
    inStock: true,
    stockQuantity: 15,
    tags: ['swing', 'hanging chair', 'outdoor', 'balcony'],
    dimensions: { length: 105, width: 80, height: 195, unit: 'cm' },
    weight: { value: 30, unit: 'kg' },
    rating: 4.5,
    reviewCount: 56
  },
  {
    name: 'Wooden Planter Box',
    category: 'Outdoor',
    price: 3499,
    description: 'Large wooden planter box with drainage. Treated for outdoor use. Perfect for growing herbs or flowers.',
    shortDescription: 'Large outdoor wooden planter',
    color: 'Natural',
    material: 'Pine Wood',
    inStock: true,
    stockQuantity: 35,
    tags: ['planter', 'garden', 'wood', 'outdoor'],
    dimensions: { length: 80, width: 35, height: 40, unit: 'cm' },
    weight: { value: 8, unit: 'kg' },
    rating: 4.2,
    reviewCount: 23
  }
];

// Helper to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Seed Function
const seedProducts = async () => {
  try {
    await connectDB();
    
    // Get all categories and create a map
    const categories = await Category.find({});
    if (categories.length === 0) {
      console.log('❌ No categories found! Run categorySeeder.js first');
      process.exit(1);
    }
    
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });
    console.log(`Loaded ${categories.length} categories`);
    
    // Clear existing products and drop indexes
    await Product.collection.dropIndexes().catch(() => {});
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Add slug and category ID to each product and insert one by one
    let insertedCount = 0;
    for (const productData of sampleProducts) {
      try {
        const categoryId = categoryMap[productData.category];
        if (!categoryId) {
          console.log(`⚠️ Category not found: ${productData.category}`);
          continue;
        }
        
        const product = new Product({
          ...productData,
          slug: generateSlug(productData.name),
          category: categoryId,
          categoryName: productData.category
        });
        await product.save();
        insertedCount++;
      } catch (err) {
        console.log(`Skipped: ${productData.name} - ${err.message}`);
      }
    }
    
    console.log(`✅ Successfully added ${insertedCount} sample products!`);
    
    // Log categories summary
    const products = await Product.find({}).populate('category', 'name');
    const categoryCounts = {};
    products.forEach(p => {
      const catName = p.category?.name || p.categoryName;
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    });
    
    console.log('\n📦 Products by Category:');
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count} products`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder
seedProducts();
