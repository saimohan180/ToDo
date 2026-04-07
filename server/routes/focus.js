const express = require("express");
const {
  createFocusSession,
  completeFocusSession,
  listFocusSessions,
  getFocusStats,
} = require("../services/focusService");

const router = express.Router();

router.get("/", (_req, res, next) => {
  try {
    const sessions = listFocusSessions(20);
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
});

router.get("/stats", (_req, res, next) => {
  try {
    const stats = getFocusStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    const session = createFocusSession(req.body);
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/complete", (req, res, next) => {
  try {
    const session = completeFocusSession(req.params.id);
    res.json(session);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
