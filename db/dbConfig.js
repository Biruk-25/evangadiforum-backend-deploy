
const mysql2 = require('mysql2');

const dbConnection = mysql2.createPool({
  host: process.env.DB_HOST,           
  user: process.env.DB_USER,           
  password: process.env.PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
});
//Test connection once when server starts
dbConnection.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL database");
    connection.release();
  }
});

module.exports = dbConnection.promise();





// const dbConnection = mysql2.createPool({
//   user: process.env.USER,
//   password: process.env.PASSWORD,
//   host: 'localhost',
//   database: process.env.DATABASE,
//   connectionLimit: 10
// });
