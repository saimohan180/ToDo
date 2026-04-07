const express = require('express');
const router = express.Router();
const settingsService = require('../services/settingsService');

router.post('/verify-password', (req, res) => {
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

router.post('/change-password', (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Both old and new passwords are required' });
    }
    
    const result = settingsService.changePassword(oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:key', (req, res) => {
  try {
    const { key } = req.params;
    const value = settingsService.getSetting(key);
    res.json({ key, value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:key', (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    const result = settingsService.setSetting(key, value);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
