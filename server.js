const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const prisma = new PrismaClient();

app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Без БД: для проверок Railway / балансировщика
app.get('/health', (req, res) => {
    res.status(200).type('text/plain').send('ok');
});

function mapOrder(order) {
    return {
        id: order.id,
        ...order.payload,
        userId: order.userId,
        status: order.status,
        createdAt: order.createdAt
    };
}

function mapReview(review) {
    return {
        id: review.id,
        ...review.payload,
        createdAt: review.createdAt
    };
}

// Routes

// Get all data
app.get('/api/data', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true, createdAt: true }
        });
        const orders = (await prisma.order.findMany({ orderBy: { createdAt: 'desc' } })).map(mapOrder);
        const reviews = (await prisma.review.findMany({ orderBy: { createdAt: 'desc' } })).map(mapReview);

        res.json({ users, orders, reviews });
    } catch (error) {
        console.error('Error loading data:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
    const { email, password, role } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const newUser = await prisma.user.create({
        data: {
        email,
            passwordHash,
        role: role || 'customer'
        }
    });
    
    res.json({ user: { id: newUser.id, email: newUser.email, role: newUser.role } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Orders routes
app.get('/api/orders', async (req, res) => {
    try {
    const userRole = req.query.role;
    const userId = Number(req.query.userId);
    
    const where = {};
    
    if (userRole === 'customer' && Number.isInteger(userId)) {
        where.userId = userId;
    }

    const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });
    
    res.json(orders.map(mapOrder));
    } catch (error) {
        console.error('Error loading orders:', error);
        res.status(500).json({ error: 'Failed to load orders' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
    const order = req.body;
    const newOrder = await prisma.order.create({
        data: {
            userId: Number.isInteger(Number(order.userId)) ? Number(order.userId) : null,
            status: 'pending',
            payload: order
        }
    });
    
    res.json({ order: mapOrder(newOrder), message: 'Order created successfully' });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
    const { id } = req.params;
    const { status } = req.body;
    const orderId = Number(id);

    const order = await prisma.order.update({
        where: { id: orderId },
        data: { status }
    });
    
    res.json({ order: mapOrder(order), message: 'Order updated successfully' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Order not found' });
        }
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Failed to update order' });
    }
});

// Reviews routes
app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews.map(mapReview));
    } catch (error) {
        console.error('Error loading reviews:', error);
        res.status(500).json({ error: 'Failed to load reviews' });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
    const review = req.body;
    const newReview = await prisma.review.create({
        data: { payload: review }
    });
    
    res.json({ review: mapReview(newReview), message: 'Review added successfully' });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

app.use(express.static(__dirname));

// SPA: всё остальное — index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

async function start() {
    try {
        await prisma.$connect();
        console.log('Database connected');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server listening on 0.0.0.0:${PORT}`);
    });
}

start();
