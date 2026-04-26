const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const quizRoutes = require('./routes/quizRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const allowedOrigins = [
  'https://skillspark-self.vercel.app',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

const { clerkMiddleware } = require('@clerk/express');
app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY
}));


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.use('/api/users', userRoutes);
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/quizzes', quizRoutes);
app.use('/api/blogs', require('./routes/blogRoutes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/', (req, res) => {
  res.send('API is working');
})

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);


const { swaggerUi, specs } = require('./swagger/swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

module.exports = app;
