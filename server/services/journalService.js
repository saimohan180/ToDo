const { db } = require('../db/db');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.JOURNAL_KEY || 'taskflow-journal-encryption-key-change-in-production';

function encrypt(text, password) {
  const key = crypto.pbkdf2Sync(password, 'salt', 100000, 32, 'sha256');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText, password) {
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const key = crypto.pbkdf2Sync(password, 'salt', 100000, 32, 'sha256');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt: Invalid password or corrupted data');
  }
}

function createEntry(date, content, password) {
  const id = `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  const encryptedContent = encrypt(content, password);
  
  const stmt = db.prepare(`
    INSERT INTO journal_entries (id, date, content, encrypted_content, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(id, date, '', encryptedContent, now, now);
  
  return { id, date, content, created_at: now, updated_at: now };
}

function updateEntry(id, content, password) {
  const now = new Date().toISOString();
  const encryptedContent = encrypt(content, password);
  
  const stmt = db.prepare(`
    UPDATE journal_entries 
    SET encrypted_content = ?, updated_at = ?
    WHERE id = ?
  `);
  
  const result = stmt.run(encryptedContent, now, id);
  
  if (result.changes === 0) {
    throw new Error('Journal entry not found');
  }
  
  return { id, content, updated_at: now };
}

function getEntry(date, password) {
  const stmt = db.prepare('SELECT * FROM journal_entries WHERE date = ?');
  const entry = stmt.get(date);
  
  if (!entry) {
    return null;
  }
  
  try {
    const content = decrypt(entry.encrypted_content, password);
    return {
      id: entry.id,
      date: entry.date,
      content,
      created_at: entry.created_at,
      updated_at: entry.updated_at
    };
  } catch (error) {
    throw new Error('Invalid password');
  }
}

function getAllEntries(password) {
  const stmt = db.prepare('SELECT * FROM journal_entries ORDER BY date DESC');
  const entries = stmt.all();
  
  return entries.map(entry => {
    try {
      const content = decrypt(entry.encrypted_content, password);
      return {
        id: entry.id,
        date: entry.date,
        content,
        created_at: entry.created_at,
        updated_at: entry.updated_at
      };
    } catch (error) {
      return {
        id: entry.id,
        date: entry.date,
        content: '[Encrypted - Invalid Password]',
        created_at: entry.created_at,
        updated_at: entry.updated_at,
        encrypted: true
      };
    }
  });
}

function deleteEntry(id) {
  const stmt = db.prepare('DELETE FROM journal_entries WHERE id = ?');
  const result = stmt.run(id);
  
  if (result.changes === 0) {
    throw new Error('Journal entry not found');
  }
  
  return { success: true };
}

function getEntriesByMonth(year, month, password) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
  
  const stmt = db.prepare(`
    SELECT * FROM journal_entries 
    WHERE date >= ? AND date <= ?
    ORDER BY date DESC
  `);
  
  const entries = stmt.all(startDate, endDate);
  
  return entries.map(entry => ({
    id: entry.id,
    date: entry.date,
    hasContent: true,
    created_at: entry.created_at,
    updated_at: entry.updated_at
  }));
}

module.exports = {
  createEntry,
  updateEntry,
  getEntry,
  getAllEntries,
  deleteEntry,
  getEntriesByMonth,
  encrypt,
  decrypt
};
