
const mysql2 = require('mysql2');

const dbConnection = mysql2.createPool({
  host: process.env.DB_HOST,           
  user: process.env.DB_USER,           
  password: process.env.PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

module.exports = dbConnection.promise();




// const mysql2 = require('mysql2');

// const dbConnection = mysql2.createPool({
//   user: process.env.USER,
//   password: process.env.PASSWORD,
//   host: 'localhost',
//   database: process.env.DATABASE,
//   connectionLimit: 10
// });

// module.exports=dbConnection.promise()