const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const quizRoutes = require('./routes/quizRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
<<<<<<< HEAD

const allowedOrigins = [
  'https://skillspark-self.vercel.app',
  'http://localhost:3000',
  // Support additional frontend URLs via env var (comma-separated)
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : []),
=======
const allowedOrigins = [
  'https://skillspark-self.vercel.app',
  'http://localhost:3000',
>>>>>>> 10e7c536420da7c3af55d2fe1654dae3713c217f
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
<<<<<<< HEAD
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
=======
>>>>>>> 10e7c536420da7c3af55d2fe1654dae3713c217f
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
<<<<<<< HEAD

=======
>>>>>>> 10e7c536420da7c3af55d2fe1654dae3713c217f
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

<<<<<<< HEAD

=======
>>>>>>> 10e7c536420da7c3af55d2fe1654dae3713c217f
module.exports = app;
