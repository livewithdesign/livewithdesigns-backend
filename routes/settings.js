const express = require('express');
const SiteSettings = require('../models/SiteSettings');

const router = express.Router();

// @desc    Get home banner settings (public)
// @route   GET /api/settings/home-banner
// @access  Public
router.get('/home-banner', async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings('main');
    
    res.json({
      success: true,
      data: settings.homeBanner
    });
  } catch (error) {
    console.error('Error fetching home banner:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch banner settings',
      error: error.message 
    });
  }
});

module.exports = router;
