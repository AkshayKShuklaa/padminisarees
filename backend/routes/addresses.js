const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /addresses
router.get('/addresses', authMiddleware, (req, res) => {
  try {
    const addresses = db.find('addresses', { userId: req.user.id });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving addresses' });
  }
});

// POST /addresses
router.post('/addresses', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { fullName, mobile, houseNo, street, landmark, city, state, pincode, addressType } = req.body;

  if (!fullName || !mobile || !houseNo || !street || !city || !state || !pincode) {
    return res.status(400).json({ message: 'All required fields must be filled' });
  }

  try {
    const newAddress = db.insert('addresses', {
      userId,
      fullName,
      mobile,
      houseNo,
      street,
      landmark: landmark || '',
      city,
      state,
      pincode,
      addressType: addressType || 'home'
    });
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: 'Error creating address' });
  }
});

// PUT /addresses/:addressId
router.put('/addresses/:addressId', authMiddleware, (req, res) => {
  const { addressId } = req.params;
  const userId = req.user.id;
  const updates = req.body;

  try {
    const address = db.findOne('addresses', { _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const updatedAddress = db.update('addresses', { _id: addressId, userId }, updates);
    res.json(updatedAddress);
  } catch (error) {
    res.status(500).json({ message: 'Error updating address' });
  }
});

// DELETE /addresses/:addressId
router.delete('/addresses/:addressId', authMiddleware, (req, res) => {
  const { addressId } = req.params;
  const userId = req.user.id;

  try {
    const address = db.findOne('addresses', { _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    db.delete('addresses', { _id: addressId, userId });
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting address' });
  }
});

module.exports = router;
