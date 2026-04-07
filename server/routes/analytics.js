const express = require("express");
const { getEfficiencyForDate } = require("../services/analyticsService");

const router = express.Router();

router.get("/", (req, res, next) => {
  try {
    const summary = getEfficiencyForDate({ date: req.query.date });
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

