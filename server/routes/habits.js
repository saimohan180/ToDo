const express = require("express");
const { db } = require("../db/db");
const crypto = require("crypto");
const { getLocalDateString, getLocalTimestamp } = require("../utils/dateHelpers");

const router = express.Router();

function generateId() {
  return crypto.randomBytes(8).toString("hex");
}

function now() {
  return getLocalTimestamp();
}

function parseFrequencyData(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Get today's habits status - MUST be before /:id route
router.get("/today/status", (req, res) => {
  const today = getLocalDateString();
  const nowDate = new Date();
  const dayOfWeek = nowDate.getDay(); // 0 = Sunday
  const dayOfMonth = nowDate.getDate();
  
  const habits = db.prepare("SELECT * FROM habits ORDER BY created_at DESC").all();
  
  const habitsWithStatus = habits.map(habit => {
    // Check if habit has expired (for limited duration)
    let isExpired = false;
    if (habit.duration_type === 'limited' && habit.duration_days) {
      const createdDate = new Date(habit.created_at);
      const expiryDate = new Date(createdDate);
      expiryDate.setDate(expiryDate.getDate() + habit.duration_days);
      isExpired = new Date() > expiryDate;
    }
    
    // Check if habit should be done today
    let isDueToday = false;
    
    if (!isExpired) {
      if (habit.frequency === 'daily') {
        isDueToday = true;
      } else if (habit.frequency === 'weekly') {
        const days = parseFrequencyData(habit.frequency_data);
        isDueToday = days.includes(dayOfWeek);
      } else if (habit.frequency === 'monthly') {
        const days = parseFrequencyData(habit.frequency_data);
        isDueToday = days.includes(dayOfMonth);
      }
    }
    
    // Check if completed today
    const completion = db
      .prepare("SELECT * FROM habit_completions WHERE habit_id = ? AND date = ?")
      .get(habit.id, today);
    
    // Calculate streak
    let currentStreak = 0;
    let checkDate = new Date();
    const completions = db
      .prepare(
        `SELECT date FROM habit_completions 
         WHERE habit_id = ? 
         ORDER BY date DESC`
      )
      .all(habit.id);
    
    // Check consecutive days from today backwards
    while (true) {
      const dateStr = getLocalDateString(checkDate);
      const completed = completions.find(c => c.date === dateStr);
      if (completed) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr === today) {
        // Allow today to not be completed yet
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return {
      ...habit,
      isDueToday,
      isCompleted: !!completion,
      completedAt: completion?.completed_at || null,
      isExpired,
      currentStreak
    };
  });
  
  res.json({ habits: habitsWithStatus, date: today });
});

// Get all habits (public + private if authorized)
router.get("/", (req, res) => {
  const habits = db
    .prepare("SELECT * FROM habits ORDER BY created_at DESC")
    .all();
  
  res.json({ habits });
});

// Get single habit with stats
router.get("/:id", (req, res) => {
  const habit = db.prepare("SELECT * FROM habits WHERE id = ?").get(req.params.id);
  if (!habit) {
    return res.status(404).json({ error: "Habit not found" });
  }

  // Get completions for last 90 days
  const completions = db
    .prepare(
      `SELECT date, completed_at FROM habit_completions 
       WHERE habit_id = ? 
       AND date >= date('now', '-90 days')
       ORDER BY date DESC`
    )
    .all(req.params.id);

  // Calculate current streak
  const today = getLocalDateString();
  let currentStreak = 0;
  let checkDate = new Date();
  
  while (true) {
    const dateStr = getLocalDateString(checkDate);
    const completed = completions.find(c => c.date === dateStr);
    
    if (completed) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate best streak
  let bestStreak = 0;
  let tempStreak = 0;
  const allCompletions = db
    .prepare(
      `SELECT date FROM habit_completions 
       WHERE habit_id = ? 
       ORDER BY date DESC`
    )
    .all(req.params.id);

  for (let i = 0; i < allCompletions.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(allCompletions[i - 1].date);
      const currDate = new Date(allCompletions[i].date);
      const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak);

  const totalCompletions = db
    .prepare("SELECT COUNT(*) as count FROM habit_completions WHERE habit_id = ?")
    .get(req.params.id);

  res.json({ 
    habit, 
    completions,
    stats: {
      currentStreak,
      bestStreak,
      totalCompletions: totalCompletions.count
    }
  });
});

// Create habit
router.post("/", (req, res) => {
  const { name, description, frequency, frequency_data, duration_type, duration_days, is_private, color, icon } = req.body;
  
  if (!name?.trim()) {
    return res.status(400).json({ error: "Name is required" });
  }
  
  if (!frequency || !['daily', 'weekly', 'monthly'].includes(frequency)) {
    return res.status(400).json({ error: "Valid frequency is required (daily, weekly, monthly)" });
  }

  const id = generateId();
  const timestamp = now();

  db.prepare(
    `INSERT INTO habits (id, name, description, frequency, frequency_data, duration_type, duration_days, is_private, color, icon, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, 
    name.trim(), 
    description || null, 
    frequency, 
    frequency_data || null,
    duration_type || 'lifetime',
    duration_days || null,
    is_private ? 1 : 0,
    color || "#00ff9c",
    icon || null,
    timestamp, 
    timestamp
  );

  const habit = db.prepare("SELECT * FROM habits WHERE id = ?").get(id);
  res.status(201).json({ habit });
});

// Update habit
router.patch("/:id", (req, res) => {
  const { name, description, frequency, frequency_data, duration_type, duration_days, is_private, color, icon } = req.body;
  
  const habit = db.prepare("SELECT * FROM habits WHERE id = ?").get(req.params.id);
  if (!habit) {
    return res.status(404).json({ error: "Habit not found" });
  }

  db.prepare(
    `UPDATE habits SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      frequency = COALESCE(?, frequency),
      frequency_data = COALESCE(?, frequency_data),
      duration_type = COALESCE(?, duration_type),
      duration_days = COALESCE(?, duration_days),
      is_private = COALESCE(?, is_private),
      color = COALESCE(?, color),
      icon = COALESCE(?, icon),
      updated_at = ?
     WHERE id = ?`
  ).run(
    name, 
    description, 
    frequency, 
    frequency_data,
    duration_type,
    duration_days,
    is_private !== undefined ? (is_private ? 1 : 0) : null,
    color,
    icon,
    now(), 
    req.params.id
  );

  const updated = db.prepare("SELECT * FROM habits WHERE id = ?").get(req.params.id);
  res.json({ habit: updated });
});

// Delete habit
router.delete("/:id", (req, res) => {
  const result = db.prepare("DELETE FROM habits WHERE id = ?").run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Habit not found" });
  }
  res.json({ success: true });
});

// Toggle completion for a date
router.post("/:id/complete", (req, res) => {
  const { date } = req.body;
  
  if (!date) {
    return res.status(400).json({ error: "Date is required" });
  }

  const habit = db.prepare("SELECT * FROM habits WHERE id = ?").get(req.params.id);
  if (!habit) {
    return res.status(404).json({ error: "Habit not found" });
  }

  // Check if already completed
  const existing = db
    .prepare("SELECT * FROM habit_completions WHERE habit_id = ? AND date = ?")
    .get(req.params.id, date);

  if (existing) {
    // Uncomplete
    db.prepare("DELETE FROM habit_completions WHERE id = ?").run(existing.id);
    return res.json({ completed: false });
  } else {
    // Complete
    const id = generateId();
    db.prepare(
      "INSERT INTO habit_completions (id, habit_id, date, completed_at) VALUES (?, ?, ?, ?)"
    ).run(id, req.params.id, date, now());
    return res.json({ completed: true });
  }
});

// Get completions for date range
router.get("/:id/completions", (req, res) => {
  const { start_date, end_date } = req.query;
  
  let query = "SELECT * FROM habit_completions WHERE habit_id = ?";
  const params = [req.params.id];
  
  if (start_date) {
    query += " AND date >= ?";
    params.push(start_date);
  }
  
  if (end_date) {
    query += " AND date <= ?";
    params.push(end_date);
  }
  
  query += " ORDER BY date DESC";
  
  const completions = db.prepare(query).all(...params);
  res.json({ completions });
});

module.exports = router;
