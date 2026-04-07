const crypto = require("node:crypto");
const { db } = require("../db/db");

function createFocusSession(payload) {
  const now = new Date().toISOString();
  const session = {
    id: crypto.randomUUID(),
    duration: payload.duration || 25,
    task_id: payload.task_id || null,
    started_at: now,
    completed_at: null,
  };

  db.prepare(
    "INSERT INTO focus_sessions (id, duration, task_id, started_at, completed_at) VALUES (@id, @duration, @task_id, @started_at, @completed_at)"
  ).run(session);

  return session;
}

function completeFocusSession(id) {
  const now = new Date().toISOString();
  db.prepare("UPDATE focus_sessions SET completed_at = ? WHERE id = ?").run(now, id);
  return db.prepare("SELECT * FROM focus_sessions WHERE id = ?").get(id);
}

function listFocusSessions(limit = 10) {
  return db
    .prepare("SELECT * FROM focus_sessions ORDER BY started_at DESC LIMIT ?")
    .all(limit);
}

function getFocusStats() {
  const today = new Date().toISOString().split('T')[0];
  
  const todayRow = db
    .prepare(
      "SELECT COUNT(*) AS count, SUM(duration) AS total_minutes FROM focus_sessions WHERE DATE(started_at) = ? AND completed_at IS NOT NULL"
    )
    .get(today);

  const allTimeRow = db
    .prepare(
      "SELECT COUNT(*) AS count, SUM(duration) AS total_minutes FROM focus_sessions WHERE completed_at IS NOT NULL"
    )
    .get();

  return {
    today: {
      sessions: Number(todayRow?.count ?? 0),
      minutes: Number(todayRow?.total_minutes ?? 0),
    },
    allTime: {
      sessions: Number(allTimeRow?.count ?? 0),
      minutes: Number(allTimeRow?.total_minutes ?? 0),
    },
  };
}

module.exports = {
  createFocusSession,
  completeFocusSession,
  listFocusSessions,
  getFocusStats,
};
