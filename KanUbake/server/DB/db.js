const mysql = require("mysql2");
require("dotenv").config({ path: __dirname + "/.env" });

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORT,
  database: "web_projekt",
  port: process.env.DB_Port
});

db.connect((err) => {
  if (err) {
    console.log("DB Fehler:", err);
  } else {
    console.log("Mit MySQL verbunden (Port " + process.env.DB_Port + ")");
  }
});

module.exports = db;