const express = require('express');
const router = express.Router();
//const db = require('../db/dbConfig');



// user controllers
const {register, login, checkUser} = require('../controller/userController');

//authonthication middleware
 const authenticate = require('../middleware/authenticate');

//register route
router.post('/register', register)


//  login user
router.post('/login', login)

 //checkUser
router.get('/check',authenticate, checkUser)

module.exports = router;

