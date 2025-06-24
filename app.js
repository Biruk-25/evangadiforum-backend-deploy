require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// DB connection
require('./db/dbConfig');

// Middleware for authentication (assuming you have this)
const authenticate = require('./middleware/authenticate');

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://frontend.waluwa.com',
      'https://biruk-25.github.io'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from: ' + origin));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
};
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json());
// Health check route
app.get('/', (req, res) => {
  res.send('🎉 Evangadi Forum Backend is running!');
});

// Import routes
const userRoutes = require('./routes/userRoute');
const questionRoutes = require('./routes/questionRoute');
const answerRoutes = require('./routes/answerRoute');

// Use route middlewares
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', authenticate, answerRoutes);

// Start server
app.listen(port, () => {
  console.log(`✅ Server listening at http://localhost:${port}`);
});

