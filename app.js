


const dotenv = require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express(); 
const port = process.env.PORT || 5000;
// const port = 5000;

// 📦 DB connection
require('./db/dbConfig');

// 🔐 Middleware
const authenticate = require('./middleware/authenticate');

// 📦 Built-in middleware
app.use(express.json()); 
app.use(cors());  

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
app.use(cors({ origin: 'https://evangadiforum-frontend.netlify.app/login' }));

// ▶️ Start server
app.listen(port, () => {
  console.log(`✅ Server listening at http://localhost:${port}`);
});
