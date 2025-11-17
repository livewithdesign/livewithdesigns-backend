const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  // Client & Location Information
  clientName: {
    type: String,
    trim: true,
    default: 'Confidential Client'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },

  // Project Specifications
  projectSize: {
    value: Number,
    unit: {
      type: String,
      enum: ['sqft', 'sqm', 'sqyd'],
      default: 'sqft'
    }
  },
  duration: {
    value: Number,
    unit: {
      type: String,
      enum: ['days', 'weeks', 'months'],
      default: 'days'
    }
  },
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    display: String // e.g., "₹8,00,000 - ₹10,00,000"
  },

  // Design Details
  designStyle: {
    type: String,
    enum: [
      'Modern',
      'Minimalist',
      'Luxury',
      'Scandinavian',
      'Traditional',
      'Contemporary',
      'Industrial',
      'Bohemian',
      'Mid-Century Modern',
      'Rustic',
      'Eclectic',
      'Asian Zen',
      'Art Deco'
    ]
  },
  
  // Key Highlights
  highlights: [{
    type: String,
    trim: true
  }],

  // Media - Images
  images: {
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail image is required']
    },
    gallery: [{
      url: String,
      caption: String,
      room: String, // Living Room, Bedroom, Kitchen, etc.
      order: Number
    }],
    beforeAfter: {
      before: String,
      after: String
    }
  },

  // Media - Video
  video: {
    url: String,
    thumbnail: String,
    duration: Number, // in seconds
    platform: {
      type: String,
      enum: ['youtube', 'vimeo', 'direct'],
      default: 'direct'
    }
  },

  // Materials & Technologies
  materials: [{
    name: String,
    brand: String,
    category: String // Flooring, Paint, Hardware, etc.
  }],

  // Room-wise Details
  rooms: [{
    name: String, // Living Room, Bedroom 1, Kitchen, etc.
    area: Number,
    features: [String],
    images: [String]
  }],

  // Project Features
  features: {
    bedrooms: Number,
    bathrooms: Number,
    balconies: Number,
    hasModularKitchen: Boolean,
    hasFalseCeiling: Boolean,
    hasWardrobes: Boolean,
    hasPooja: Boolean,
    hasStudyRoom: Boolean,
    parking: Number
  },

  // Client Testimonial
  testimonial: {
    text: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    clientName: String,
    date: Date
  },

  // Project Status
  status: {
    type: String,
    enum: ['completed', 'ongoing', 'upcoming'],
    default: 'completed'
  },
  completionDate: Date,
  
  // SEO & Meta
  metaTitle: String,
  metaDescription: String,
  tags: [String],

  // Visibility & Featured
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create slug from title before saving
projectSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Update category project count when project is created
projectSchema.post('save', async function() {
  const Category = mongoose.model('Category');
  const count = await mongoose.model('Project').countDocuments({ category: this.category });
  await Category.findByIdAndUpdate(this.category, { projectCount: count });
});

// Update category project count when project is deleted
projectSchema.post('deleteOne', { document: true, query: false }, async function() {
  const Category = mongoose.model('Category');
  const count = await mongoose.model('Project').countDocuments({ category: this.category });
  await Category.findByIdAndUpdate(this.category, { projectCount: count });
});

module.exports = mongoose.model('Project', projectSchema);