
const jwt = require('jsonwebtoken');
const { StatusCodes } = require('http-status-codes');

const JWT_SECRET = process.env.JWT_SECRET;

// 🔐 Middleware to verify JWT and attach user info to req.user
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check for Bearer token
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Authorization token missing or malformed',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (err) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: 'Invalid or expired token',
      error: err.message,
    });
  }
};

module.exports = authenticate;




// const jwt = require('jsonwebtoken');
// const { StatusCodes } = require('http-status-codes');

// const JWT_SECRET = process.env.JWT_SECRET;

// // 🔐 Middleware to verify JWT and attach user info to req.user
// const authenticate = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   // Check for Bearer token
//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res
//       .status(StatusCodes.UNAUTHORIZED)
//       .json({ message: 'Authorization token missing or malformed' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);

//     // Attach decoded user info to request
//     req.user = {
//       id: decoded.id,
//       username: decoded.username,
//     };

//     next();
//   } catch (err) {
//     return res
//       .status(StatusCodes.UNAUTHORIZED)
//       .json({ message: 'Invalid or expired token', error: err.message });
//   }
// };

// module.exports = authenticate;

