

const mysql2 = require('mysql2');

const dbConnection = mysql2.createPool({
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: 'localhost',
  database: process.env.DATABASE,
  connectionLimit: 10
});



// // Test connection
// dbConnection.execute("SELECT 'test'", (err, result) => {
//   if (err) {
//     console.log("DB connection failed:", err);
//   } else {
//     console.log(result);
//   }
// });

// Export the promise-based version for async/await usage
module.exports = dbConnection.promise();




// const mysql2 = require('mysql2')


// const dbConnection = mysql2.createPool({
//    user:process.env.USER,
//    database: process.env.DATABASE,
//    host:'localhost',
//    password:process.env.PASSWORD,
//    connectionLimit:10
// })

// dbConnection.getConnection((err, connection) => {
//   if (err) {
//     console.error("DB connection failed:", err);
//   } else {
//     console.log("DB connected!");
//     connection.release();
//   }
// });

// 

