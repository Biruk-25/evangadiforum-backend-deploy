


const dotenv = require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express(); 
const port = process.env.PORT || 5000;
// const port = 5000;
console.log("🌍 ENV test:", process.env.DB_USER);

// 📦 DB connection
require('./db/dbConfig');

// 🔐 Middleware
const authenticate = require('./middleware/authenticate');

// 📦 Built-in middleware
app.use(express.json()); 
 
//const cors = require('cors');

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://frontend.waluwa.com',
  'https://biruk-25.github.io',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin: ' + origin));
    }
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// ✅ Middleware
app.use(cors(corsOptions));

// ✅ This handles preflight requests (OPTIONS)
//app.options('/', cors(corsOptions));

// const corsOptions = {
//   origin: function (origin, callback) {
//     const allowedOrigins = [
//       'http://localhost:5173',
//       'https://frontend.waluwa.com',
//       'https://biruk-25.github.io',
//     ];
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('CORS not allowed for this origin: ' + origin));
//     }
//   },
//   credentials: true,
// };

// // Main CORS middleware for all requests
// app.use(cors(corsOptions));

// Proper preflight (OPTIONS) handler
//app.options('/*', cors(corsOptions));


// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   next();
// });




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
