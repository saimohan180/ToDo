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

function ensureColumn(tableName, columnName, columnDefinition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const hasColumn = columns.some((column) => column.name === columnName);
  if (!hasColumn) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDefinition}`);
  }
}

// Backward-compatible migrations for existing databases.
ensureColumn("habits", "duration_type", "TEXT NOT NULL DEFAULT 'lifetime'");
ensureColumn("habits", "duration_days", "INTEGER");
ensureColumn("habits", "icon", "TEXT");

module.exports = {
  db,
  dbFilePath,
};
