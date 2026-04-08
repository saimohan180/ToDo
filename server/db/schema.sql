CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#00ff9c',
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT,
  project_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  created_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id TEXT PRIMARY KEY,
  duration INTEGER NOT NULL,
  task_id TEXT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  content TEXT NOT NULL,
  encrypted_content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(date);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  background TEXT NOT NULL DEFAULT '#1a1a2e',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS board_elements (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sticky', 'text', 'shape', 'image')),
  content TEXT,
  x REAL NOT NULL DEFAULT 100,
  y REAL NOT NULL DEFAULT 100,
  width REAL NOT NULL DEFAULT 200,
  height REAL NOT NULL DEFAULT 150,
  color TEXT NOT NULL DEFAULT '#fef08a',
  font_size INTEGER DEFAULT 14,
  shape_type TEXT,
  z_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_board_elements_board ON board_elements(board_id);

CREATE TABLE IF NOT EXISTS board_connections (
  id TEXT PRIMARY KEY,
  board_id TEXT NOT NULL,
  from_element_id TEXT NOT NULL,
  to_element_id TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#888888',
  stroke_width INTEGER NOT NULL DEFAULT 2,
  style TEXT NOT NULL DEFAULT 'solid' CHECK (style IN ('solid', 'dashed', 'dotted')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
  FOREIGN KEY (from_element_id) REFERENCES board_elements(id) ON DELETE CASCADE,
  FOREIGN KEY (to_element_id) REFERENCES board_elements(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_board_connections_board ON board_connections(board_id);

CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  frequency_data TEXT,
  duration_type TEXT NOT NULL DEFAULT 'lifetime' CHECK (duration_type IN ('lifetime', 'limited')),
  duration_days INTEGER,
  is_private INTEGER NOT NULL DEFAULT 0,
  color TEXT NOT NULL DEFAULT '#00ff9c',
  icon TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS habit_completions (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  date TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
  UNIQUE(habit_id, date)
);

CREATE INDEX IF NOT EXISTS idx_habit_completions_habit ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(date);

