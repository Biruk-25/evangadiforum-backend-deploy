

const express = require('express');
const router = express.Router();
const db = require('../db/dbConfig');
const authenticate = require('../middleware/authenticate');
const { StatusCodes } = require('http-status-codes');

/**
 * POST an answer to a specific question (protected)
 */
router.post('/:questionid', authenticate, async (req, res) => {
  const { answer } = req.body;
  const { questionid } = req.params;
  const { id: userid } = req.user;

  if (!answer || !answer.trim()) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Answer is required' });
  }

  try {
    // Insert answer
    const [result] = await db.query(
      `INSERT INTO answers (content, questionid, userid)
       VALUES (?, ?, ?)`,
      [answer.trim(), questionid, userid]
    );

    // Increment answer count in question table
    await db.query(
      `UPDATE questions SET answer_count = answer_count + 1 WHERE questionid = ?`,
      [questionid]
    );

    res.status(StatusCodes.CREATED).json({
      message: 'Answer posted successfully',
      answerid: result.insertId,
    });
  } catch (err) {
    console.error('❌ Error posting answer:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error posting answer',
      error: err.message,
    });
  }
});

/**
 * GET all answers for a specific question
 */
router.get('/:questionid', async (req, res) => {
  const { questionid } = req.params;

  try {
    const [answers] = await db.query(
      `SELECT 
         a.answerid,
         a.content AS answer,
         a.created_at,
         a.views,
         u.userName AS username,
         COALESCE(SUM(CASE WHEN v.vote_type = 'like' THEN 1 ELSE 0 END), 0) AS likes,
         COALESCE(SUM(CASE WHEN v.vote_type = 'dislike' THEN 1 ELSE 0 END), 0) AS dislikes
       FROM answers a
       JOIN users u ON a.userid = u.id
       LEFT JOIN answer_votes v ON a.answerid = v.answerid
       WHERE a.questionid = ?
       GROUP BY a.answerid
       ORDER BY a.created_at DESC`,
      [questionid]
    );

    res.status(StatusCodes.OK).json(answers);
  } catch (err) {
    console.error('❌ Error fetching answers:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching answers',
      error: err.message,
    });
  }
});

/**
 * PATCH - Increment views for an answer (only once per user)
 */
router.patch('/views/:answerid', authenticate, async (req, res) => {
  const { answerid } = req.params;
  const { id: userid } = req.user;

  try {
    const [existing] = await db.query(
      `SELECT * FROM answer_views WHERE userid = ? AND answerid = ?`,
      [userid, answerid]
    );

    if (existing.length > 0) {
      return res.sendStatus(StatusCodes.NO_CONTENT); // already viewed
    }

    // Record unique view
    await db.query(
      `INSERT INTO answer_views (userid, answerid) VALUES (?, ?)`,
      [userid, answerid]
    );

    // Increment view count
    await db.query(
      `UPDATE answers SET views = views + 1 WHERE answerid = ?`,
      [answerid]
    );

    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    console.error('❌ Error incrementing views:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating views',
      error: err.message,
    });
  }
});

/**
 * PATCH - Like an answer (only once per user)
 */
router.patch('/like/:answerid', authenticate, async (req, res) => {
  const { answerid } = req.params;
  const { id: userid } = req.user;

  try {
    const [existing] = await db.query(
      `SELECT * FROM answer_votes WHERE answerid = ? AND userid = ?`,
      [answerid, userid]
    );

    if (existing.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({ message: 'You already voted on this answer' });
    }

    await db.query(
      `INSERT INTO answer_votes (answerid, userid, vote_type)
       VALUES (?, ?, 'like')`,
      [answerid, userid]
    );

    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    console.error('❌ Error liking answer:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error liking answer' });
  }
});

/**
 * PATCH - Dislike an answer (only once per user)
 */
router.patch('/dislike/:answerid', authenticate, async (req, res) => {
  const { answerid } = req.params;
  const { id: userid } = req.user;

  try {
    const [existing] = await db.query(
      `SELECT * FROM answer_votes WHERE answerid = ? AND userid = ?`,
      [answerid, userid]
    );

    if (existing.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({ message: 'You already voted on this answer' });
    }

    await db.query(
      `INSERT INTO answer_votes (answerid, userid, vote_type)
       VALUES (?, ?, 'dislike')`,
      [answerid, userid]
    );

    res.sendStatus(StatusCodes.NO_CONTENT);
  } catch (err) {
    console.error('❌ Error disliking answer:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error disliking answer' });
  }
});

module.exports = router;




// const express = require('express');
// const router = express.Router();
// const db = require('../db/dbConfig');
// const authenticate = require('../middleware/authenticate');
// const { StatusCodes } = require('http-status-codes');

// /**
//  * POST an answer to a specific question (protected)
//  */
// router.post('/:questionid', authenticate, async (req, res) => {
//   const { answer } = req.body;
//   const { questionid } = req.params;
//   const { id: userid } = req.user;

//   if (!answer || !answer.trim()) {
//     return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Answer is required' });
//   }

//   try {
//     // Insert answer
//     const [result] = await db.query(
//       `INSERT INTO answers (content, questionid, userid)
//        VALUES (?, ?, ?)`,
//       [answer.trim(), questionid, userid]
//     );

//     // Increment answer_count
//     await db.query(
//       `UPDATE questions SET answer_count = answer_count + 1 WHERE questionid = ?`,
//       [questionid]
//     );

//     res.status(StatusCodes.CREATED).json({
//       message: 'Answer posted successfully',
//       answerid: result.insertId,
//     });
//   } catch (err) {
//     console.error('❌ Error posting answer:', err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       message: 'Error posting answer',
//       error: err.message,
//     });
//   }
// });

// /**
//  * GET all answers for a specific question, including user info and vote stats
//  */
// router.get('/:questionid', async (req, res) => {
//   const { questionid } = req.params;

//   try {
//     const [answers] = await db.query(
//       `SELECT 
//          a.answerid,
//          a.content AS answer,
//          a.created_at,
//          a.views,
//          u.userName AS username,
//          COALESCE(SUM(CASE WHEN v.vote_type = 'like' THEN 1 ELSE 0 END), 0) AS likes,
//          COALESCE(SUM(CASE WHEN v.vote_type = 'dislike' THEN 1 ELSE 0 END), 0) AS dislikes
//        FROM answers a
//        JOIN users u ON a.userid = u.id
//        LEFT JOIN answer_votes v ON a.answerid = v.answerid
//        WHERE a.questionid = ?
//        GROUP BY a.answerid
//        ORDER BY a.created_at DESC`,
//       [questionid]
//     );

//     res.status(StatusCodes.OK).json(answers);
//   } catch (err) {
//     console.error('❌ Error fetching answers:', err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       message: 'Error fetching answers',
//       error: err.message,
//     });
//   }
// });

// /**
//  * PATCH - Increment views for an answer
//  */
// router.patch('/views/:answerid',authenticate, async (req, res) => {
//   const { answerid } = req.params;
//   const { id: userid } = req.user;

//   try {
//     await db.query(
//       `UPDATE answers SET views = views + 1 WHERE answerid = ?`,
//       [answerid]
//     );
//     res.sendStatus(StatusCodes.NO_CONTENT);
//   } catch (err) {
//     console.error('❌ Error incrementing views:', err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       message: 'Error updating views',
//     });
//   }
// });

// /**
//  * PATCH - Like an answer (only once per user)
//  */
// router.patch('/like/:answerid', authenticate, async (req, res) => {
//   const { answerid } = req.params;
//   const { id: userid } = req.user;

//   try {
//     const [existing] = await db.query(
//       `SELECT * FROM answer_votes WHERE answerid = ? AND userid = ?`,
//       [answerid, userid]
//     );

//     if (existing.length > 0) {
//       return res.status(StatusCodes.CONFLICT).json({ message: 'You already voted on this answer' });
//     }

//     await db.query(
//       `INSERT INTO answer_votes (answerid, userid, vote_type)
//        VALUES (?, ?, 'like')`,
//       [answerid, userid]
//     );

//     res.sendStatus(StatusCodes.NO_CONTENT);
//   } catch (err) {
//     console.error('❌ Error liking answer:', err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error liking answer' });
//   }
// });

// /**
//  * PATCH - Dislike an answer (only once per user)
//  */
// router.patch('/dislike/:answerid', authenticate, async (req, res) => {
//   const { answerid } = req.params;
//   const { id: userid } = req.user;

//   try {
//     const [existing] = await db.query(
//       `SELECT * FROM answer_votes WHERE answerid = ? AND userid = ?`,
//       [answerid, userid]
//     );

//     if (existing.length > 0) {
//       return res.status(StatusCodes.CONFLICT).json({ message: 'You already voted on this answer' });
//     }

//     await db.query(
//       `INSERT INTO answer_votes (answerid, userid, vote_type)
//        VALUES (?, ?, 'dislike')`,
//       [answerid, userid]
//     );

//     res.sendStatus(StatusCodes.NO_CONTENT);
//   } catch (err) {
//     console.error('❌ Error disliking answer:', err);
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error disliking answer' });
//   }
// });

// module.exports = router;






