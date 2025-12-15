const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Home Banner Settings
  homeBanner: {
    mediaUrl: {
      type: String,
      default: '/elegant-living-room.png'
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },
    mediaPublicId: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: 'Exceptional House Design & Interior Solutions'
    },
    subtitle: {
      type: String,
      default: 'Discover premium interior design products and services that bring elegance and functionality to every corner of your home. From design consultations to full home transformations.'
    },
    primaryButtonText: {
      type: String,
      default: 'Shop Now'
    },
    primaryButtonLink: {
      type: String,
      default: '/store'
    },
    secondaryButtonText: {
      type: String,
      default: 'Our Services'
    },
    secondaryButtonLink: {
      type: String,
      default: '/services'
    }
  },
  // Other settings can be added here
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to get or create settings
siteSettingsSchema.statics.getSettings = async function(key = 'main') {
  let settings = await this.findOne({ key });
  if (!settings) {
    settings = await this.create({ key });
  }
  return settings;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
