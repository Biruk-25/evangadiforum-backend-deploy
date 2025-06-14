
const db = require('../db/dbConfig');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Helper to generate JWT with both id and username
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// ✅ Register controller
const register = async (req, res) => {
  const { username, firstname, lastname, email, password } = req.body;

  if (!username || !firstname || !lastname || !email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'All fields are required' });
  }

  if (!validator.isEmail(email)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid email format' });
  }

  if (password.length < 6) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUser.length > 0) {
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
      token,
      user: {
        id: user.id,
        username: user.username,
        email: email.trim().toLowerCase()
      }
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error registering user', error: err.message });
  }
};

// ✅ Login controller
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email and password required' });
  }

  try {
    const [users] = await db.query(
      'SELECT id, username, email, password FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);

    res.status(StatusCodes.OK).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Login error', error: err.message });
  }
};

// ✅ Check User controller
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
      email: rows[0].email
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Check error', error: err.message });
  }
};

module.exports = { register, login, checkUser };



// const db = require('../db/dbConfig');
// const bcrypt = require('bcrypt');
// const validator = require('validator');
// const jwt = require('jsonwebtoken');
// const { StatusCodes } = require('http-status-codes');
// require('dotenv').config();

// const JWT_SECRET = process.env.JWT_SECRET;
// console.log();

// // Helper to generate JWT
// const generateToken = (userId) => {
//   return jwt.sign({ id: userId, username: user.username}, JWT_SECRET, { expiresIn: '1d' });
// };

// // Register controller
// const register = async (req, res) => {
//   const { username, firstname, lastname, email, password } = req.body;

//   // Validate input
//   if (!username || !firstname || !lastname || !email || !password) {
//     return res.status(StatusCodes.BAD_REQUEST).json({ message: 'All fields are required' });
//   }

//   if (!validator.isEmail(email)) {
//     return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid email format' });
//   }

//   if (password.length < 6) {
//     return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Password must be at least 6 characters long' });
//   }

//   try {
//     const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
//     if (existingUser.length > 0) {
//       return res.status(StatusCodes.CONFLICT).json({ message: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const [result] = await db.query(
//       'INSERT INTO users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)',
//       [username.trim(), firstname.trim(), lastname.trim(), email.trim().toLowerCase(), hashedPassword]
//     );

//     const token = generateToken(result.insertId);

//     res.status(StatusCodes.CREATED).json({
//       message: 'User registered successfully',
//       token,
//       user: {
//         id: result.insertId,
//         username,
//         email: email.trim().toLowerCase()
//       }
//     });
//   } catch (err) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error registering user', error: err.message });
//   }
// };

// // Login controller
// const login = async (req, res) => {
//   const { email, password } = req.body;

//   // Validate input
//   if (!email || !password) {
//     return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email and password required' });
//   }

//   try {
//     const [users] = await db.query(
//       'SELECT id, username, email, password FROM users WHERE email = ?',
//       [email.trim().toLowerCase()]
//     );

//     const user = users[0];
//     if (!user) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid email or password' });
//     }

//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid email or password' });
//     }

//     const token = generateToken(user.id);

//     res.status(StatusCodes.OK).json({
//       message: 'Login successful',
//       token,
//       user: {
//         id: user.id,
//         username: user.username,
//         email: user.email
//       }
//     });
//   } catch (err) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Login error', error: err.message });
//   }
// };

// // Check User controller (GET)

// const checkUser = async (req, res) => {
//   const { id, username } = req.user; // provided by JWT middleware

//   try {
//     const [rows] = await db.query('SELECT email FROM users WHERE id = ?', [id]);

//     if (rows.length === 0) {
//       return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
//     }

//     res.status(StatusCodes.OK).json({
//       exists: true,
//       userid: id,
//       username,
//       email: rows[0].email
//     });
//   } catch (err) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       message: 'Check error',
//       error: err.message
//     });
//   }
// };


// module.exports = { register, login, checkUser };







// const db = require('../db/dbConfig');
// const bcrypt = require('bcrypt');
// const validator = require('validator');
// const jwt = require('jsonwebtoken');
// const { StatusCodes } = require('http-status-codes');

// // JWT secret (use environment variable in real apps)
// const JWT_SECRET = process.env.JWT_SECRET

// // Helper to generate JWT
// const generateToken = (userId) => {
//   return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' }); // token valid for 1 day
// };

// //Register controller
// const register = async (req, res) => {
//   const { username, firstname, lastname, email, password } = req.body;

//   if (!username || !firstname || !lastname || !email || !password) {
//     return res.status(StatusCodes.BAD_REQUEST).json({ message: 'All fields are required' });
//   }

//   if (!validator.isEmail(email)) {
//     return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid email format' });
//   }


//   try {
//     const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
//     if (existingUser.length > 0) {
//       return res.status(StatusCodes.CONFLICT).json({ message: 'User already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const [result] = await db.query(
//       'INSERT INTO users (username, firstname, lastname, email, password) VALUES (?, ?, ?, ?, ?)',
//       [username.trim(), firstname.trim(), lastname.trim(), email.trim().toLowerCase(), hashedPassword]
//     );

//     const token = generateToken(result.insertId);

//     res.status(StatusCodes.CREATED).json({
//       message: 'User registered successfully',
//       token,
//       user: {
//         id: result.insertId,
//         username,
//         email
//       }
//     });
//   } catch (err) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error registering user', error: err.message });
//   }
// };

// // Login controller
// const login = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email and password required' });
//   }

//   try {
//     const [users] = await db.query('SELECT username,userid, password, FROM users WHERE email = ? ', [email.trim()]);
    
//   if (password.length < 6) {
//     return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Password must be at least 6 characters long' });
//   }
//     const user = users[0];

//     if (!user) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid email or password' });
//     }

//     const isPasswordMatch = await bcrypt.compare(password, user[0].password);
//     if (!isPasswordMatch) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid email or password' });
//     }

//     const token = generateToken(user.id);

//     res.status(StatusCodes.OK).json({message: 'Login successful', token,
//       user: {
//         id: user[0].id,
//         username: user[0].username,
//         email: user.email
//       }
//     });
//   } catch (err) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Login error', error: err.message });
//   }
// };

// // Check User controller (GET)
// const checkUser = async (req, res) => {
//   const email = req.query.email;

//   if (!email || !validator.isEmail(email)) {
//     return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Valid email is required' });
//   }

//   try {
//     const [rows] = await db.equery('SELECT * FROM users WHERE email = ?', [email.trim()]);
//     res.status(StatusCodes.OK).json({ exists: rows.length > 0 });
//   } catch (err) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Check error', error: err.message });
//   }
// };

// module.exports = { register, login, checkUser };











