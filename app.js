


const dotenv = require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express(); 
const port = process.env.PORT || 5000;

console.log("🌍 ENV test:", process.env.DB_USER);

// 📦 DB connection
require('./db/dbConfig');

// 🔐 Middleware
const authenticate = require('./middleware/authenticate');

// 📦 Built-in middleware
app.use(express.json()); 
 
const allowedOrigins = [
  'https://frontend.waluwa.com',
  'https://biruk-25.github.io'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed from: ' + origin));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization']
};

// ✅ Use CORS globally
app.use(cors(corsOptions));
//app.options('/*', cors(corsOptions)); // ✅ Fix for Express 5

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('🎉 Evangadi Forum Backend is running!');
});

// 📁 Route Imports
const userRoutes = require('./routes/userRoute');
const questionRoutes = require('./routes/questionRoute');
const answerRoutes = require('./routes/answerRoute');

// 🛣️ Route Middlewares
app.use('/api/users', userRoutes); 
app.use('/api/questions', questionRoutes); 
app.use('/api/answers', authenticate, answerRoutes);   


// ▶️ Start server
app.listen(port, () => {
  console.log(`✅ Server listening at http://localhost:${port}`);
});
