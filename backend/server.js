const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./db');
const { User, Product, Order, Coupon } = require('./models');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

// Middleware
app.use(cors());
app.use(express.json());

// --- Middleware: Authenticate Token ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- ROUTES: AUTH ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'user' // Default role
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check for admin hardcoded bypass (Legacy support from Mock)
    if (email === 'admin' && password === 'Chopkeeper') {
         // Create a token for the super admin
         const token = jwt.sign({ userId: 'admin-id', role: 'admin', name: 'Super Admin' }, JWT_SECRET, { expiresIn: '1h' });
         return res.json({ token, user: { id: 'admin-id', name: 'Super Admin', email: 'admin', role: 'admin' } });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Create Token
    const token = jwt.sign({ userId: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

    res.json({ 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Current User
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.userId === 'admin-id') {
        return res.json({ id: 'admin-id', name: 'Super Admin', email: 'admin', role: 'admin' });
    }
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.sendStatus(404);
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    res.sendStatus(500);
  }
});

// --- ROUTES: PRODUCTS ---

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    // Map _id to id for frontend compatibility
    const formatted = products.map(p => ({
        ...p.toObject(),
        id: p._id.toString()
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...updated.toObject(), id: updated._id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- ROUTES: ORDERS ---

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const orderData = {
        ...req.body,
        userId: req.user.userId === 'admin-id' ? null : req.user.userId // Handle admin mock user
    };
    const newOrder = new Order(orderData);
    const saved = await newOrder.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    let query = {};
    // If not admin, only show own orders
    if (req.user.role !== 'admin') {
      query = { userId: req.user.userId };
    }
    
    const orders = await Order.find(query).sort({ createdAt: -1 });
    const formatted = orders.map(o => ({
        ...o.toObject(),
        id: o._id.toString(),
        timestamp: new Date(o.createdAt).getTime() // Compat with frontend
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Seed Initial Data (Dev helper)
app.get('/api/seed', async (req, res) => {
    // Check if products exist, if not seed
    const count = await Product.countDocuments();
    if (count === 0) {
        // Import mock data here if needed, or just return empty
        res.json({ message: 'Database is empty. Please add products via Admin.' });
    } else {
        res.json({ message: 'Database already has data.' });
    }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});