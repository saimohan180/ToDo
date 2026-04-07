const crypto = require("node:crypto");
const { db } = require("../db/db");
const {
  badRequest,
  normalizeDateInput,
  requireNonEmptyString,
  normalizeStatus,
} = require("../utils/validators");

function getTaskById(id) {
  return db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) ?? null;
}

function listTasks({ date } = {}) {
  const normalizedDate = normalizeDateInput(date);

  if (normalizedDate === undefined) {
    return db
      .prepare(
        "SELECT * FROM tasks ORDER BY CASE WHEN date IS NULL THEN 1 ELSE 0 END, date, created_at DESC",
      )
      .all();
  }

  if (normalizedDate === null) {
    return db
      .prepare("SELECT * FROM tasks WHERE date IS NULL ORDER BY created_at DESC")
      .all();
  }

  return db
    .prepare("SELECT * FROM tasks WHERE date = ? ORDER BY created_at DESC")
    .all(normalizedDate);
}

function createTask(payload) {
  if (!payload || typeof payload !== "object") {
    throw badRequest("Request body must be a JSON object.");
  }

  const title = requireNonEmptyString(payload.title, "title");
  const date = normalizeDateInput(payload.date);
  const project_id = payload.project_id || null;
  const now = new Date().toISOString();
  const task = {
    id: crypto.randomUUID(),
    title,
    date,
    project_id,
    status: "pending",
    created_at: now,
    completed_at: null,
  };

  db.prepare(
    "INSERT INTO tasks (id, title, date, project_id, status, created_at, completed_at) VALUES (@id, @title, @date, @project_id, @status, @created_at, @completed_at)",
  ).run(task);

  return task;
}

function updateTask(id, payload) {
  if (!payload || typeof payload !== "object") {
    throw badRequest("Request body must be a JSON object.");
  }

  const existing = getTaskById(id);
  if (!existing) {
    return null;
  }

  const updates = [];
  const params = { id };

  if (Object.prototype.hasOwnProperty.call(payload, "title")) {
    params.title = requireNonEmptyString(payload.title, "title");
    updates.push("title = @title");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "date")) {
    params.date = normalizeDateInput(payload.date);
    updates.push("date = @date");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "project_id")) {
    params.project_id = payload.project_id;
    updates.push("project_id = @project_id");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "status")) {
    const status = normalizeStatus(payload.status);
    params.status = status;
    updates.push("status = @status");

    if (status === "done") {
      params.completed_at = existing.completed_at ?? new Date().toISOString();
      updates.push("completed_at = @completed_at");
    } else {
      params.completed_at = null;
      updates.push("completed_at = @completed_at");
    }
  }

  if (updates.length === 0) {
    throw badRequest("No valid fields supplied for update.");
  }

  db.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = @id`).run(params);
  return getTaskById(id);
}

function deleteTask(id) {
  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return result.changes > 0;
}

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
};

