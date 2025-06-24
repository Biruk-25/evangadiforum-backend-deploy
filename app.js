require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// DB connect
require('./db/dbConfig');

// CORS setup for GitHub Pages
const corsOptions = {
  origin: ['https://biruk-25.github.io'],
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
//app.options('*', cors(corsOptions)); 

app.use(express.json());

// Routes
const userRoutes = require('./routes/userRoute');
const questionRoutes = require('./routes/questionRoute');
const answerRoutes = require('./routes/answerRoute');
const authenticate = require('./middleware/authenticate');

app.get('/', (req, res) => res.send('🎉 Backend is live'));
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', authenticate, answerRoutes);

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
