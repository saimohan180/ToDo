const { db } = require('../db/db');
const bcrypt = require('bcryptjs');

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('admin', 10);

function initializeSettings() {
  const stmt = db.prepare('SELECT * FROM settings WHERE key = ?');
  const passwordSetting = stmt.get('journal_password_hash');
  
  if (!passwordSetting) {
    const insertStmt = db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, ?)
    `);
    insertStmt.run('journal_password_hash', DEFAULT_PASSWORD_HASH, new Date().toISOString());
  }
}

function verifyPassword(password) {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const setting = stmt.get('journal_password_hash');
  
  if (!setting) {
    initializeSettings();
    return bcrypt.compareSync(password, DEFAULT_PASSWORD_HASH);
  }
  
  return bcrypt.compareSync(password, setting.value);
}

function changePassword(oldPassword, newPassword) {
  if (!verifyPassword(oldPassword)) {
    throw new Error('Invalid current password');
  }
  
  if (newPassword.length < 4) {
    throw new Error('New password must be at least 4 characters');
  }
  
  const newHash = bcrypt.hashSync(newPassword, 10);
  const now = new Date().toISOString();
  
  const stmt = db.prepare(`
    UPDATE settings 
    SET value = ?, updated_at = ?
    WHERE key = ?
  `);
  
  stmt.run(newHash, now, 'journal_password_hash');
  
  return { success: true, message: 'Password changed successfully' };
}

function getSetting(key) {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const setting = stmt.get(key);
  return setting ? setting.value : null;
}

function setSetting(key, value) {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?
  `);
  
  stmt.run(key, value, now, value, now);
  return { success: true };
}

module.exports = {
  initializeSettings,
  verifyPassword,
  changePassword,
  getSetting,
  setSetting
};
