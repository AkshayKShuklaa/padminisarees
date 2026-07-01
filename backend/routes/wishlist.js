const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /wishlist
router.get('/wishlist', authMiddleware, (req, res) => {
  const userId = req.user.id;
  try {
    const wishlistItems = db.find('wishlist', { userId });
    const products = db.getCollection('products');
    
    // Populate product details
    const populatedWishlist = wishlistItems
      .map(item => products.find(p => p._id === item.productId))
      .filter(Boolean); // Remove any nulls if product doesn't exist

    res.json(populatedWishlist);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving wishlist' });
  }
});

// POST /wishlist/toggle
router.post('/wishlist/toggle', authMiddleware, (req, res) => {
  const { productId } = req.body;
  const userId = req.user.id;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const existing = db.findOne('wishlist', { userId, productId });
    
    if (existing) {
      db.delete('wishlist', { _id: existing._id });
      res.json({ added: false, message: 'Removed from wishlist' });
    } else {
      db.insert('wishlist', { userId, productId });
      res.json({ added: true, message: 'Added to wishlist' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error toggling wishlist' });
  }
});

module.exports = router;
