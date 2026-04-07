const express = require('express');
const router = express.Router();
const journalService = require('../services/journalService');
const settingsService = require('../services/settingsService');

router.post('/verify', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    const isValid = settingsService.verifyPassword(password);
    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/entries', (req, res) => {
  try {
    const { date, content, password } = req.body;
    
    if (!date || !content || !password) {
      return res.status(400).json({ error: 'Date, content, and password are required' });
    }
    
    if (!settingsService.verifyPassword(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const entry = journalService.createEntry(date, content, password);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/entries/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { content, password } = req.body;
    
    if (!content || !password) {
      return res.status(400).json({ error: 'Content and password are required' });
    }
    
    if (!settingsService.verifyPassword(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const entry = journalService.updateEntry(id, content, password);
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/entries/by-date', (req, res) => {
  try {
    const { date, password } = req.body;
    
    if (!date || !password) {
      return res.status(400).json({ error: 'Date and password are required' });
    }
    
    if (!settingsService.verifyPassword(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const entry = journalService.getEntry(date, password);
    res.json(entry || { date, content: '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/entries/list', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    if (!settingsService.verifyPassword(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const entries = journalService.getAllEntries(password);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/entries/month', (req, res) => {
  try {
    const { year, month, password } = req.body;
    
    if (!year || !month || !password) {
      return res.status(400).json({ error: 'Year, month, and password are required' });
    }
    
    if (!settingsService.verifyPassword(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const entries = journalService.getEntriesByMonth(year, month, password);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/entries/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    if (!settingsService.verifyPassword(password)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    const result = journalService.deleteEntry(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
