const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: String,
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  thumbnail: String,
  url: {
    type: String,
    required: [true, 'URL is required']
  },
  category: String,
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Media', mediaSchema);