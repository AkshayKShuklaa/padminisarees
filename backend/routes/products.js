const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /products
router.get('/products', async (req, res) => {
  try {
    const products = await db.getCollection('products');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products' });
  }
});

// GET /reviews/:productId
router.get('/reviews/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const reviews = (await db.find('reviews', { productId })) || [];
    
    // Calculate review summary stats
    const count = reviews.length;
    let avg = 0;
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    if (count > 0) {
      let sum = 0;
      reviews.forEach(r => {
        const rating = Math.round(Number(r.rating || 5));
        if (breakdown[rating] !== undefined) {
          breakdown[rating]++;
        }
        sum += Number(r.rating || 5);
      });
      avg = Number((sum / count).toFixed(1));
    }
    
    res.json({
      reviews,
      count,
      avg,
      breakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving reviews' });
  }
});

// POST /reviews/:productId
router.post('/reviews/:productId', authMiddleware, async (req, res) => {
  const { productId } = req.params;
  const { rating, title, body } = req.body;
  const userId = req.user.id;

  if (!rating) {
    return res.status(400).json({ message: 'Rating is required' });
  }

  try {
    // Get user's name
    const user = await db.findOne('users', { _id: userId });
    const userName = user ? user.name : 'Anonymous';

    const newReview = await db.insert('reviews', {
      productId,
      userId,
      userName,
      rating: Number(rating),
      title: title || '',
      body: body || '',
      createdAt: new Date().toISOString()
    });

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting review' });
  }
});

module.exports = router;
