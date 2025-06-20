const db = require('../db/dbConfig');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 Generate JWT token
const generateToken = ({ id, username }) => {
  return jwt.sign({ id, username }, JWT_SECRET,{ expiresIn: '1d' });
  
};

// 📝 Register controller
const register = async (req, res) => {
  const { username, firstname, lastname, email, password } = req.body;

  if (!username || !firstname || !lastname || !email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'All fields are required' });
  }

  if (!validator.isEmail(email)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid email format' });
  }

  if (password.length < 8) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Password must be at least 8 characters' });
  }

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)',
      [username.trim(), firstname.trim(), lastname.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    const user = { id: result.insertId, username: username.trim() };
    const token = generateToken(user);

    res.status(StatusCodes.CREATED).json({
      message: 'User registered successfully',
      // token,
      user: {
        id: user.id,
        username: user.username,
        email: email.trim().toLowerCase(),
      },
    });
  } catch (err) {
    console.error('Register Route Error:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};

// 🔑 Login controller
const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login response:', res.data);

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email and password required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT id, username, email, password FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.status(StatusCodes.OK).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Login error', error: err.message });
  }
};

// ✅ Check authenticated user
const checkUser = async (req, res) => {
  const { id, username } = req.user;

  try {
    const [rows] = await db.query('SELECT email FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
    }

    res.status(StatusCodes.OK).json({
      exists: true,
      userid: id,
      username,
      email: rows[0].email,
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error checking user', error: err.message });
  }
};

// ✏️ Update user profile
const updateUser = async (req, res) => {
  const { id } = req.user;
  const { username, firstname, lastname, email, password } = req.body;

  if (!username || !firstname || !lastname || !email) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'All fields are required' });
  }

  try {
    let query = 'UPDATE users SET username = ?, firstname = ?, lastname = ?, email = ?';
    const values = [username.trim(), firstname.trim(), lastname.trim(), email.trim().toLowerCase()];

    if (password) {
      if (password.length < 6) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Password must be at least 6 characters' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ', password = ?';
      values.push(hashedPassword);
    }

    query += ' WHERE id = ?';
    values.push(id);

    await db.query(query, values);

    res.status(StatusCodes.OK).json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update user', error: err.message });
  }
};



// ❌ Delete user account
const deleteUser = async (req, res) => {
  const { id } = req.user;

  try {
    // First, delete related questions
    await db.query('DELETE FROM questions WHERE userId = ?', [id]);
    // Then, optionally delete user
    await db.query('DELETE FROM users WHERE id = ?', [id]);

    res.status(StatusCodes.OK).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete user', error: err.message });
  }
};

module.exports = {
  register,
  login,
  checkUser,
  updateUser,
  deleteUser,
};
