const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Helper to populate cart items with product details
async function getPopulatedCart(userId) {
  const cartItems = await db.find('cart', { userId });
  const products = await db.getCollection('products');

  return cartItems.map(item => {
    const product = products.find(p => p._id === item.productId);
    return {
      _id: item._id,
      productId: item.productId,
      quantity: item.quantity,
      variant: item.variant || '',
      name: product ? product.name : 'Unknown Product',
      price: product ? product.price : 0,
      image: product ? product.image : '',
      stock: product ? product.stock : 0
    };
  });
}

// GET /cart
router.get('/cart', authMiddleware, async (req, res) => {
  try {
    const populatedCart = await getPopulatedCart(req.user.id);
    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving cart' });
  }
});

// POST /cart/add
router.post('/cart/add', authMiddleware, async (req, res) => {
  const { productId, quantity, variant } = req.body;
  const userId = req.user.id;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  const qty = Number(quantity) || 1;

  try {
    // Check if item already exists in user's cart
    const existingItem = await db.findOne('cart', { userId, productId, variant: variant || '' });
    
    if (existingItem) {
      await db.update('cart', { _id: existingItem._id }, { quantity: existingItem.quantity + qty });
    } else {
      await db.insert('cart', {
        userId,
        productId,
        quantity: qty,
        variant: variant || ''
      });
    }

    res.json(await getPopulatedCart(userId));
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

// PUT /cart/update
router.put('/cart/update', authMiddleware, async (req, res) => {
  const { productId, cartItemId, quantity } = req.body;
  const userId = req.user.id;

  if (!cartItemId || quantity === undefined) {
    return res.status(400).json({ message: 'Cart Item ID and quantity are required' });
  }

  const qty = Number(quantity);

  try {
    if (qty <= 0) {
      await db.delete('cart', { _id: cartItemId, userId });
    } else {
      await db.update('cart', { _id: cartItemId, userId }, { quantity: qty });
    }

    res.json(await getPopulatedCart(userId));
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart' });
  }
});

// DELETE /cart/remove/:cartItemId
router.delete('/cart/remove/:cartItemId', authMiddleware, async (req, res) => {
  const { cartItemId } = req.params;
  const userId = req.user.id;

  try {
    await db.delete('cart', { _id: cartItemId, userId });
    res.json(await getPopulatedCart(userId));
  } catch (error) {
    res.status(500).json({ message: 'Error removing item from cart' });
  }
});

// POST /cart/merge
router.post('/cart/merge', authMiddleware, async (req, res) => {
  const { items } = req.body; // Array of { productId, quantity, variant }
  const userId = req.user.id;

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: 'Items array is required' });
  }

  try {
    for (const item of items) {
      const existingItem = await db.findOne('cart', { userId, productId: item.productId, variant: item.variant || '' });
      if (existingItem) {
        await db.update('cart', { _id: existingItem._id }, { quantity: Math.max(existingItem.quantity, item.quantity) });
      } else {
        await db.insert('cart', {
          userId,
          productId: item.productId,
          quantity: item.quantity,
          variant: item.variant || ''
        });
      }
    }
    res.json(await getPopulatedCart(userId));
  } catch (error) {
    res.status(500).json({ message: 'Error merging cart' });
  }
});

module.exports = router;
