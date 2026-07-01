const express = require('express');
const router = express.Router();
const db = require('../db');
const { adminMiddleware } = require('../middleware/auth');

// GET /admin/stats
router.get('/admin/stats', adminMiddleware, async (req, res) => {
  try {
    const orders = await db.getCollection('orders');
    const users = await db.getCollection('users');
    const products = await db.getCollection('products');

    // Calculate total revenue from paid or COD orders
    const totalRevenue = orders.reduce((sum, order) => {
      // Assuming all orders contribute unless cancelled
      if (order.status !== 'Cancelled') {
        return sum + (order.amount || 0);
      }
      return sum;
    }, 0);

    // Calculate status breakdown
    const statusBreakdown = {};
    orders.forEach(order => {
      statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
    });

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      totalUsers: users.length,
      totalProducts: products.length,
      statusBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating admin stats' });
  }
});

// GET /admin/users
router.get('/admin/users', adminMiddleware, async (req, res) => {
  try {
    const rawUsers = await db.getCollection('users');
    const users = rawUsers.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users' });
  }
});

// GET /admin/orders
router.get('/admin/orders', adminMiddleware, async (req, res) => {
  try {
    const orders = await db.getCollection('orders');
    const sortedOrders = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(sortedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders' });
  }
});

// GET /admin/products
router.get('/admin/products', adminMiddleware, async (req, res) => {
  try {
    const products = await db.getCollection('products');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products' });
  }
});

// PATCH /admin/users/:userId/role
router.patch('/admin/users/:userId/role', adminMiddleware, async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ message: 'Role is required' });
  }

  try {
    const user = await db.findOne('users', { _id: userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await db.update('users', { _id: userId }, { role });
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role' });
  }
});

// PATCH /admin/orders/:orderId/status
router.patch('/admin/orders/:orderId/status', adminMiddleware, async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const order = await db.findOne('orders', { _id: orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status and payment status if delivered
    const updates = { status };
    if (status === 'Delivered') {
      updates.paymentStatus = 'Paid';
    }

    const updatedOrder = await db.update('orders', { _id: orderId }, updates);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// POST /admin/products (Create Product)
router.post('/admin/products', adminMiddleware, async (req, res) => {
  const productData = req.body;
  if (!productData.name || !productData.price) {
    return res.status(400).json({ message: 'Product name and price are required' });
  }

  try {
    const newProduct = await db.insert('products', {
      ...productData,
      price: Number(productData.price),
      discountPrice: productData.discountPrice ? Number(productData.discountPrice) : undefined,
      discountPercent: productData.discountPercent ? Number(productData.discountPercent) : undefined,
      stock: productData.stock !== undefined ? Number(productData.stock) : 10,
      images: Array.isArray(productData.images) ? productData.images : [productData.image].filter(Boolean)
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

// PUT /admin/products/:productId (Update Product)
router.put('/admin/products/:productId', adminMiddleware, async (req, res) => {
  const { productId } = req.params;
  const productData = req.body;

  try {
    const product = await db.findOne('products', { _id: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await db.update('products', { _id: productId }, {
      ...productData,
      price: productData.price ? Number(productData.price) : product.price,
      discountPrice: productData.discountPrice !== undefined ? (productData.discountPrice ? Number(productData.discountPrice) : null) : product.discountPrice,
      discountPercent: productData.discountPercent !== undefined ? (productData.discountPercent ? Number(productData.discountPercent) : null) : product.discountPercent,
      stock: productData.stock !== undefined ? Number(productData.stock) : product.stock,
      images: Array.isArray(productData.images) ? productData.images : product.images
    });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product' });
  }
});

// DELETE /admin/products/:productId
router.delete('/admin/products/:productId', adminMiddleware, async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await db.findOne('products', { _id: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await db.delete('products', { _id: productId });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product' });
  }
});

module.exports = router;
