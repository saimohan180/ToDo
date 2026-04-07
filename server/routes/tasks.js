const express = require("express");
const {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../services/taskService");

const router = express.Router();

router.get("/", (req, res, next) => {
  try {
    const tasks = listTasks({ date: req.query.date });
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    const task = createTask(req.body);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", (req, res, next) => {
  try {
    const updatedTask = updateTask(req.params.id, req.body);

    if (!updatedTask) {
      res.status(404).json({ error: "Task not found." });
      return;
    }

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    const deleted = deleteTask(req.params.id);

    if (!deleted) {
      res.status(404).json({ error: "Task not found." });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;

