const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "database.db");
const db = new sqlite3.Database(dbPath);

db.run("PRAGMA journal_mode=WAL");

module.exports = db;
