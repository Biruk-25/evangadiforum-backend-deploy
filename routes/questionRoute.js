
const express = require('express');
const router = express.Router();
const db = require('../db/dbConfig');
const authenticate = require('../middleware/authenticate');
const { StatusCodes } = require('http-status-codes');

// ✅ POST: Ask a new question (protected)
router.post('/', authenticate, async (req, res) => {
  const { title, description } = req.body;
  const { id: userId, username: userName } = req.user;

  if (!title || !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Title and description are required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO questions (title, description, userId, userName) VALUES (?, ?, ?, ?)',
      [title.trim(), description.trim(), userId, userName]
    );

    res.status(StatusCodes.CREATED).json({
      message: 'Question posted successfully',
      questionId: result.insertId
    });
  } catch (err) {
    console.error("❌ Error inserting question:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error posting question', error: err.message });
  }
});

//  GET: All questions (public)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT q.questionid, q.title, q.description, q.created_at,q.answer_count, u.username 
       FROM questions q 
       JOIN users u ON q.userId = u.id 
       ORDER BY q.created_at DESC`
    );
    res.status(StatusCodes.OK).json(rows);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching questions', error: err.message });
  }
});

// ✅ GET: Single question by ID (public)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT q.questionid, q.title, q.description, q.created_at, u.username 
       FROM questions q 
       JOIN users u ON q.userId = u.id 
       WHERE q.questionid = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Question not found' });
    }

    res.status(StatusCodes.OK).json(rows[0]);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching question', error: err.message });
  }
});

module.exports = router;




