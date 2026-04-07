const express = require("express");
const { db } = require("../db/db");
const crypto = require("crypto");

const router = express.Router();

function generateId() {
  return crypto.randomBytes(8).toString("hex");
}

function now() {
  return new Date().toISOString();
}

// Get all boards
router.get("/", (_req, res) => {
  const boards = db
    .prepare(
      `SELECT b.*, 
        (SELECT COUNT(*) FROM board_elements WHERE board_id = b.id) as element_count
       FROM boards b ORDER BY b.updated_at DESC`
    )
    .all();
  res.json({ boards });
});

// Get single board with elements and connections
router.get("/:id", (req, res) => {
  const board = db.prepare("SELECT * FROM boards WHERE id = ?").get(req.params.id);
  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  const elements = db
    .prepare("SELECT * FROM board_elements WHERE board_id = ? ORDER BY z_index ASC")
    .all(req.params.id);

  const connections = db
    .prepare("SELECT * FROM board_connections WHERE board_id = ?")
    .all(req.params.id);

  res.json({ board, elements, connections });
});

// Create board
router.post("/", (req, res) => {
  const { name, description, background } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }

  const id = generateId();
  const timestamp = now();

  db.prepare(
    `INSERT INTO boards (id, name, description, background, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, name.trim(), description || null, background || "#1a1a2e", timestamp, timestamp);

  const board = db.prepare("SELECT * FROM boards WHERE id = ?").get(id);
  res.status(201).json({ board });
});

// Update board
router.patch("/:id", (req, res) => {
  const { name, description, background } = req.body;
  const board = db.prepare("SELECT * FROM boards WHERE id = ?").get(req.params.id);
  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  db.prepare(
    `UPDATE boards SET 
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      background = COALESCE(?, background),
      updated_at = ?
     WHERE id = ?`
  ).run(name, description, background, now(), req.params.id);

  const updated = db.prepare("SELECT * FROM boards WHERE id = ?").get(req.params.id);
  res.json({ board: updated });
});

// Delete board
router.delete("/:id", (req, res) => {
  const result = db.prepare("DELETE FROM boards WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Board not found" });
  }
  res.json({ success: true });
});

// === ELEMENTS ===

// Add element to board
router.post("/:id/elements", (req, res) => {
  const { type, content, x, y, width, height, color, font_size, shape_type } = req.body;
  
  const board = db.prepare("SELECT * FROM boards WHERE id = ?").get(req.params.id);
  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  if (!type || !["sticky", "text", "shape", "image"].includes(type)) {
    return res.status(400).json({ error: "Valid type is required (sticky, text, shape, image)" });
  }

  const id = generateId();
  const timestamp = now();

  // Get max z_index
  const maxZ = db
    .prepare("SELECT MAX(z_index) as max FROM board_elements WHERE board_id = ?")
    .get(req.params.id);
  const z_index = (maxZ?.max ?? 0) + 1;

  db.prepare(
    `INSERT INTO board_elements 
     (id, board_id, type, content, x, y, width, height, color, font_size, shape_type, z_index, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, req.params.id, type, content || "", 
    x ?? 100, y ?? 100, 
    width ?? (type === "text" ? 300 : 200), 
    height ?? (type === "text" ? 100 : 150),
    color || (type === "sticky" ? "#fef08a" : "#ffffff"),
    font_size ?? 14,
    shape_type || null,
    z_index,
    timestamp, timestamp
  );

  // Update board timestamp
  db.prepare("UPDATE boards SET updated_at = ? WHERE id = ?").run(timestamp, req.params.id);

  const element = db.prepare("SELECT * FROM board_elements WHERE id = ?").get(id);
  res.status(201).json({ element });
});

// Update element
router.patch("/:boardId/elements/:elementId", (req, res) => {
  const { content, x, y, width, height, color, font_size, z_index } = req.body;
  
  const element = db.prepare(
    "SELECT * FROM board_elements WHERE id = ? AND board_id = ?"
  ).get(req.params.elementId, req.params.boardId);
  
  if (!element) {
    return res.status(404).json({ error: "Element not found" });
  }

  const timestamp = now();

  db.prepare(
    `UPDATE board_elements SET
      content = COALESCE(?, content),
      x = COALESCE(?, x),
      y = COALESCE(?, y),
      width = COALESCE(?, width),
      height = COALESCE(?, height),
      color = COALESCE(?, color),
      font_size = COALESCE(?, font_size),
      z_index = COALESCE(?, z_index),
      updated_at = ?
     WHERE id = ?`
  ).run(content, x, y, width, height, color, font_size, z_index, timestamp, req.params.elementId);

  // Update board timestamp
  db.prepare("UPDATE boards SET updated_at = ? WHERE id = ?").run(timestamp, req.params.boardId);

  const updated = db.prepare("SELECT * FROM board_elements WHERE id = ?").get(req.params.elementId);
  res.json({ element: updated });
});

// Delete element
router.delete("/:boardId/elements/:elementId", (req, res) => {
  const result = db.prepare(
    "DELETE FROM board_elements WHERE id = ? AND board_id = ?"
  ).run(req.params.elementId, req.params.boardId);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: "Element not found" });
  }

  // Update board timestamp
  db.prepare("UPDATE boards SET updated_at = ? WHERE id = ?").run(now(), req.params.boardId);

  res.json({ success: true });
});

// Bring element to front
router.post("/:boardId/elements/:elementId/bring-to-front", (req, res) => {
  const element = db.prepare(
    "SELECT * FROM board_elements WHERE id = ? AND board_id = ?"
  ).get(req.params.elementId, req.params.boardId);
  
  if (!element) {
    return res.status(404).json({ error: "Element not found" });
  }

  const maxZ = db
    .prepare("SELECT MAX(z_index) as max FROM board_elements WHERE board_id = ?")
    .get(req.params.boardId);

  db.prepare("UPDATE board_elements SET z_index = ? WHERE id = ?")
    .run((maxZ?.max ?? 0) + 1, req.params.elementId);

  res.json({ success: true });
});

// === CONNECTIONS ===

// Add connection
router.post("/:id/connections", (req, res) => {
  const { from_element_id, to_element_id, color, stroke_width, style } = req.body;
  
  const board = db.prepare("SELECT * FROM boards WHERE id = ?").get(req.params.id);
  if (!board) {
    return res.status(404).json({ error: "Board not found" });
  }

  if (!from_element_id || !to_element_id) {
    return res.status(400).json({ error: "from_element_id and to_element_id are required" });
  }

  // Verify both elements exist on this board
  const fromEl = db.prepare("SELECT id FROM board_elements WHERE id = ? AND board_id = ?")
    .get(from_element_id, req.params.id);
  const toEl = db.prepare("SELECT id FROM board_elements WHERE id = ? AND board_id = ?")
    .get(to_element_id, req.params.id);

  if (!fromEl || !toEl) {
    return res.status(400).json({ error: "Both elements must exist on this board" });
  }

  const id = generateId();
  const timestamp = now();

  db.prepare(
    `INSERT INTO board_connections 
     (id, board_id, from_element_id, to_element_id, color, stroke_width, style, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, req.params.id, from_element_id, to_element_id,
    color || "#888888", stroke_width ?? 2, style || "solid", timestamp
  );

  const connection = db.prepare("SELECT * FROM board_connections WHERE id = ?").get(id);
  res.status(201).json({ connection });
});

// Update connection
router.patch("/:boardId/connections/:connectionId", (req, res) => {
  const { color, stroke_width, style } = req.body;
  
  const connection = db.prepare(
    "SELECT * FROM board_connections WHERE id = ? AND board_id = ?"
  ).get(req.params.connectionId, req.params.boardId);
  
  if (!connection) {
    return res.status(404).json({ error: "Connection not found" });
  }

  db.prepare(
    `UPDATE board_connections SET
      color = COALESCE(?, color),
      stroke_width = COALESCE(?, stroke_width),
      style = COALESCE(?, style)
     WHERE id = ?`
  ).run(color, stroke_width, style, req.params.connectionId);

  const updated = db.prepare("SELECT * FROM board_connections WHERE id = ?").get(req.params.connectionId);
  res.json({ connection: updated });
});

// Delete connection
router.delete("/:boardId/connections/:connectionId", (req, res) => {
  const result = db.prepare(
    "DELETE FROM board_connections WHERE id = ? AND board_id = ?"
  ).run(req.params.connectionId, req.params.boardId);
  
  if (result.changes === 0) {
    return res.status(404).json({ error: "Connection not found" });
  }

  res.json({ success: true });
});

module.exports = router;
