


// const dotenv = require('dotenv').config();
// const cors = require('cors')
// const express = require('express');
// const app = express(); 
// const port = 5000;

// // DB connection
// require('./db/dbConfig');





// // 🔐 Middleware
// const authenticate = require('./middleware/authenticate');



// // 📦 Built-in middleware
// app.use(express.json()); // Parse JSON requests

// // 🔄 Optional: CORS setup (uncomment if connecting frontend)
// // const cors = require('cors');
// app.use(cors());

// //  Routes middleware
// const userRoutes = require('./routes/userRoute');
// const questionRoutes = require('./routes/questionRoute');
// const answerRoutes = require('./routes/answerRoute');



// app.use('/api/users', userRoutes);
// //authenticate, 

// app.use('/api/questions',authenticate, questionRoutes,  (req, res) => {
//   res.json({ message: 'You are authenticated', user: req.user });
// });
// app.use('/api/users', authenticate, userRoutes,  (req, res) => {
//   res.json({ message: 'You are authenticated', user: req.user });
// });

// app.use('/api/answers', authenticate, answerRoutes,  (req, res) => {
//   res.json({ message: 'You are authenticated', user: req.user });
// });


// // ▶️ Start server
// app.listen(port, () => {
//   console.log(`✅ Server listening at http://localhost:${port}`);
// });

const dotenv = require('dotenv').config();
const cors = require('cors');
const express = require('express');
const app = express(); 
const port = 5000;

// 📦 DB connection
require('./db/dbConfig');

// 🔐 Middleware
const authenticate = require('./middleware/authenticate');

// 📦 Built-in middleware
app.use(express.json()); // Parse JSON requests
app.use(cors());         // Enable CORS

// 📁 Route Imports
const userRoutes = require('./routes/userRoute');
const questionRoutes = require('./routes/questionRoute');
const answerRoutes = require('./routes/answerRoute');

// 🛣️ Route Middlewares
app.use('/api/users', userRoutes); // Public routes for register/login
app.use('/api/questions', questionRoutes); //  authenticate,
app.use('/api/answers', authenticate, answerRoutes);     // Protected

// ▶️ Start server
app.listen(port, () => {
  console.log(`✅ Server listening at http://localhost:${port}`);
});
