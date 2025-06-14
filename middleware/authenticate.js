


const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Save decoded info to req.user
    req.user = {
      id: decoded.id,
      username: decoded.username,
    };

    //  Safe to log decoded user info here
    //console.log('Authenticated user:', req.user);

    next();
  } catch (err) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Invalid token', error: err.message });
  }
};

module.exports = authenticate;




//    const jwt = require('jsonwebtoken');
// const { StatusCodes } = require('http-status-codes');

// const JWT_SECRET = process.env.JWT_SECRET;

// const authenticate = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'No token provided' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);

//     // Attach user info to request
//     req.user = {
//       username: decoded.username,
//       id: decoded.id // ✅ Consistent naming (use "id" instead of "userid" if your token has "id")
//     };

//     next();
//   } catch (err) {
//     return res.status(StatusCodes.UNAUTHORIZED).json({
//       message: 'Invalid token',
//       error: err.message
//     });
//   }
// };

// module.exports = authenticate;

   
   
   // const db = require('../db/dbConfig');
// const bcrypt = require('bcrypt');
// const validator = require('validator');
// const jwt = require('jsonwebtoken');
// const { StatusCodes } = require('http-status-codes');
// require('dotenv').config();

// const JWT_SECRET = process.env.JWT_SECRET;

// // 🔐 Helper to generate JWT
// const generateToken = (userId, username) => {
//   return jwt.sign({ id: userId, username:user.username }, JWT_SECRET, { expiresIn: '1d' });
// };

// // 📝 Register controller
// const register = async (req, res) => {
//   const { username, firstname, lastname, email, password } = req.body;

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

//     const token = generateToken(result.insertId, username);

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

// // 🔐 Login controller
// const login = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email and password are required' });
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

//     const token = generateToken(user.id, user.username);

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

// // 👤 Check authenticated user
// const checkUser = async (req, res) => {
//   const { id, username } = req.user;

//   try {
//     const [rows] = await db.query('SELECT email FROM users WHERE id = ?', [id]);
//     res.status(StatusCodes.OK).json({
//       exists: rows.length > 0,
//       id,
//       username,
//       email: rows[0]?.email || null
//     });
//   } catch (err) {
//     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Check error', error: err.message });
//   }
// };

// module.exports = { register, login, checkUser };

