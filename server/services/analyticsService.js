const { db } = require("../db/db");
const { normalizeDateInput } = require("../utils/validators");

function getEfficiencyForDate({ date } = {}) {
  const normalizedDate = normalizeDateInput(date);
  let row;

  if (normalizedDate === undefined) {
    row = db
      .prepare(
        "SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed FROM tasks",
      )
      .get();
  } else if (normalizedDate === null) {
    row = db
      .prepare(
        "SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed FROM tasks WHERE date IS NULL",
      )
      .get();
  } else {
    row = db
      .prepare(
        "SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed FROM tasks WHERE date = ?",
      )
      .get(normalizedDate);
  }

  const total = Number(row?.total ?? 0);
  const completed = Number(row?.completed ?? 0);
  const efficiency = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    total,
    completed,
    efficiency,
  };
}

module.exports = {
  getEfficiencyForDate,
};

