require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// ✅ Connect to DB
require('./db/dbConfig');

// ✅ CORS configuration
const corsOptions = {
  origin: 'https://biruk-25.github.io',  // GitHub Pages frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
};

app.use(cors(corsOptions));     
app.use(express.json());

// ✅ Import routes
const authenticate = require('./middleware/authenticate');
const userRoutes = require('./routes/userRoute');
const questionRoutes = require('./routes/questionRoute');
const answerRoutes = require('./routes/answerRoute');

// ✅ Health Check
app.get('/', (req, res) => res.send('🎉 Backend running!'));

// ✅ Use routes
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', authenticate, answerRoutes);

// ✅ Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
