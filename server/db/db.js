const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const dbDirectory = path.join(process.cwd(), "data");
const dbFilePath = path.join(dbDirectory, "taskflow.db");
const schemaPath = path.join(__dirname, "schema.sql");

if (!fs.existsSync(dbDirectory)) {
  fs.mkdirSync(dbDirectory, { recursive: true });
}

const db = new Database(dbFilePath);
const schemaSql = fs.readFileSync(schemaPath, "utf8");

db.pragma("journal_mode = WAL");
db.exec(schemaSql);

module.exports = {
  db,
  dbFilePath,
};

