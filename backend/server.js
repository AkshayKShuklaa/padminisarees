const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend local development ports
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Seed a default admin user if not exists
async function seedAdminUser() {
  try {
    const adminEmail = 'admin@akaya.com';
    const existingAdmin = db.findOne('users', { email: adminEmail });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.insert('users', {
        name: 'Akaya Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default admin user seeded:');
      console.log('  Email: admin@akaya.com');
      console.log('  Password: admin123');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

seedAdminUser();

// Mount API Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const addressRoutes = require('./routes/addresses');
const checkoutRoutes = require('./routes/checkout');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

app.use('/api', authRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api', wishlistRoutes);
app.use('/api', addressRoutes);
app.use('/api', checkoutRoutes);
app.use('/api', orderRoutes);
app.use('/api', adminRoutes);
app.use('/api', uploadRoutes);

// Root path handler
app.get('/', (req, res) => {
  res.json({ message: 'Akaya Living Local Backend API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'An internal server error occurred' });
});

app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`Akaya Living Backend running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api`);
  console.log(`=============================================`);
});

module.exports = app;
