const express = require('express');
const router = express.Router();
const db = require('../db/dbConfig');
const authenticate = require('../middleware/authenticate');
const { StatusCodes } = require('http-status-codes');

/**
 * POST /questions
 * Create a new question (authenticated)
 */
router.post('/', authenticate, async (req, res) => {
  const { title, description } = req.body;
  const { id: userid, username: userName } = req.user;

  if (!title || !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Title and description are required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO questions (title, description, userid, userName) VALUES (?, ?, ?, ?)',
      [title.trim(), description.trim(), userid, userName]
    );

    res.status(StatusCodes.CREATED).json({
      message: 'Question posted successfully',
      questionid: result.insertid,
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error posting question', error: err.message });
  }
});

/**
 * GET /questions
 * Get all questions (public)
 */
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT q.questionid, q.title, q.description, q.created_at, q.answer_count, u.username 
       FROM questions q 
       JOIN users u ON q.userid = u.id 
       ORDER BY q.created_at DESC`
    );
    res.status(StatusCodes.OK).json(rows);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching questions', error: err.message });
  }
});

/**
 * GET /questions/:id
 * Get a single question by id (public)
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT q.questionid, q.title, q.description, q.created_at, u.username 
       FROM questions q 
       JOIN users u ON q.userid = u.id 
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

/**
 * PUT /questions/:id
 * Update a question (authenticated, owner only)
 */
router.put('/:id', authenticate, async (req, res) => {
  const { id: questionid } = req.params;
  const { title, description } = req.body;
  const { id: userid } = req.user;

  if (!title || !description) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Title and description are required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM questions WHERE questionid = ? AND userid = ?',
      [questionid, userid]
    );

    if (rows.length === 0) {
      return res.status(StatusCodes.FORBidDEN).json({ message: 'You are not authorized to update this question' });
    }

    await db.query(
      'UPDATE questions SET title = ?, description = ? WHERE questionid = ?',
      [title.trim(), description.trim(), questionid]
    );

    res.status(StatusCodes.OK).json({ message: 'Question updated successfully' });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error updating question', error: err.message });
  }
});

/**
 * DELETE /questions/:id
 * Delete a question (authenticated, owner only)
 */
router.delete('/:id', authenticate, async (req, res) => {
  const { id: questionid } = req.params;
  const { id: userid } = req.user;

  try {
    const [rows] = await db.query(
      'SELECT * FROM questions WHERE questionid = ? AND userid = ?',
      [questionid, userid]
    );

    if (rows.length === 0) {
      return res.status(StatusCodes.FORBidDEN).json({ message: 'You are not authorized to delete this question' });
    }

    await db.query('DELETE FROM questions WHERE questionid = ?', [questionid]);

    res.status(StatusCodes.OK).json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error deleting question', error: err.message });
  }
});

module.exports = router;
