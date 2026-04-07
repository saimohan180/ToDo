const crypto = require("node:crypto");
const { db } = require("../db/db");
const { badRequest, requireNonEmptyString } = require("../utils/validators");

function listProjects() {
  return db
    .prepare("SELECT * FROM projects ORDER BY created_at DESC")
    .all();
}

function getProjectById(id) {
  return db.prepare("SELECT * FROM projects WHERE id = ?").get(id) ?? null;
}

function createProject(payload) {
  if (!payload || typeof payload !== "object") {
    throw badRequest("Request body must be a JSON object.");
  }

  const name = requireNonEmptyString(payload.name, "name");
  const color = payload.color || '#00ff9c';
  const description = payload.description || null;
  
  const now = new Date().toISOString();
  const project = {
    id: crypto.randomUUID(),
    name,
    color,
    description,
    created_at: now,
  };

  db.prepare(
    "INSERT INTO projects (id, name, color, description, created_at) VALUES (@id, @name, @color, @description, @created_at)"
  ).run(project);

  return project;
}

function updateProject(id, payload) {
  if (!payload || typeof payload !== "object") {
    throw badRequest("Request body must be a JSON object.");
  }

  const existing = getProjectById(id);
  if (!existing) {
    return null;
  }

  const updates = [];
  const params = { id };

  if (Object.prototype.hasOwnProperty.call(payload, "name")) {
    params.name = requireNonEmptyString(payload.name, "name");
    updates.push("name = @name");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "color")) {
    params.color = payload.color || '#00ff9c';
    updates.push("color = @color");
  }

  if (Object.prototype.hasOwnProperty.call(payload, "description")) {
    params.description = payload.description;
    updates.push("description = @description");
  }

  if (updates.length === 0) {
    throw badRequest("No valid fields supplied for update.");
  }

  db.prepare(`UPDATE projects SET ${updates.join(", ")} WHERE id = @id`).run(params);
  return getProjectById(id);
}

function deleteProject(id) {
  const result = db.prepare("DELETE FROM projects WHERE id = ?").run(id);
  return result.changes > 0;
}

function getProjectTasks(projectId) {
  return db
    .prepare("SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC")
    .all(projectId);
}

function getProjectStats(projectId) {
  const row = db
    .prepare(
      "SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed FROM tasks WHERE project_id = ?"
    )
    .get(projectId);

  const total = Number(row?.total ?? 0);
  const completed = Number(row?.completed ?? 0);
  const efficiency = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, efficiency };
}

module.exports = {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks,
  getProjectStats,
};
