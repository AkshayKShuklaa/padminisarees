const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /orders
router.get('/orders', authMiddleware, (req, res) => {
  const userId = req.user.id;
  try {
    const orders = db.find('orders', { userId });
    // Sort by newest first
    const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sortedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders' });
  }
});

module.exports = router;
