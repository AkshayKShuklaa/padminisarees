const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// Helper to calculate order totals and verify stock
function processOrderItems(items) {
  const products = db.getCollection('products');
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = products.find(p => p._id === item.productId);
    if (!product) {
      throw new Error(`Product not found: ${item.productId}`);
    }
    
    // In local development, we won't block checkout due to stock to make testing easier,
    // but we will deduct stock if available.
    const price = product.discountPrice || product.price;
    totalAmount += price * item.quantity;

    orderItems.push({
      productId: item.productId,
      name: product.name,
      price: price,
      quantity: item.quantity,
      variant: item.variant || '',
      image: product.image
    });

    // Deduct stock
    const newStock = Math.max(0, product.stock - item.quantity);
    db.update('products', { _id: product._id }, { stock: newStock });
  }

  return { totalAmount, orderItems };
}

// Helper to resolve delivery address
function resolveAddress(userId, addressId, guestDeliveryAddress) {
  if (guestDeliveryAddress) {
    return guestDeliveryAddress;
  }
  
  if (addressId) {
    const address = db.findOne('addresses', { _id: addressId, userId });
    return address || null;
  }

  // Fallback: get the latest address for this user
  const addresses = db.find('addresses', { userId });
  return addresses.length > 0 ? addresses[addresses.length - 1] : null;
}

// POST /checkout/cod (Cash on Delivery)
router.post('/checkout/cod', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { items, note, guestDeliveryAddress, addressId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order items are required' });
  }

  try {
    const { totalAmount, orderItems } = processOrderItems(items);
    const shippingAddress = resolveAddress(userId, addressId, guestDeliveryAddress);

    const newOrder = db.insert('orders', {
      userId,
      items: orderItems,
      amount: totalAmount,
      status: 'Processing',
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      shippingAddress,
      note: note || ''
    });

    // Clear user's cart after successful order
    db.delete('cart', { userId });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully (COD)',
      orderId: newOrder._id,
      amount: newOrder.amount,
      address: newOrder.shippingAddress
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error placing COD order' });
  }
});

// POST /checkout/create-order (Online Payment Order Creation)
router.post('/checkout/create-order', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { items, guestDeliveryAddress, addressId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order items are required' });
  }

  try {
    const products = db.getCollection('products');
    let totalAmount = 0;
    for (const item of items) {
      const product = products.find(p => p._id === item.productId);
      if (product) {
        totalAmount += (product.discountPrice || product.price) * item.quantity;
      }
    }

    // Generate a mock Razorpay Order ID
    const mockRazorpayOrderId = 'order_mock_' + Math.random().toString(36).substring(2, 15);

    res.json({
      success: true,
      id: mockRazorpayOrderId, // Razorpay SDK expects 'id' in the order object
      orderId: mockRazorpayOrderId,
      amount: totalAmount * 100, // Razorpay expects amount in paise (cents)
      currency: 'INR'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment order' });
  }
});

// POST /checkout/verify-payment
router.post('/checkout/verify-payment', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items, note, guestDeliveryAddress, addressId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Order items are required' });
  }

  try {
    const { totalAmount, orderItems } = processOrderItems(items);
    const shippingAddress = resolveAddress(userId, addressId, guestDeliveryAddress);

    // In local development, we automatically verify any payment
    const newOrder = db.insert('orders', {
      userId,
      items: orderItems,
      amount: totalAmount,
      status: 'Processing',
      paymentMethod: 'Online',
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id || 'pay_mock_' + Math.random().toString(36).substring(2, 10),
      shippingAddress,
      note: note || ''
    });

    // Clear user's cart
    db.delete('cart', { userId });

    res.json({
      success: true,
      message: 'Payment verified and order created',
      orderId: newOrder._id,
      amount: newOrder.amount,
      address: newOrder.shippingAddress
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error verifying payment' });
  }
});

module.exports = router;
