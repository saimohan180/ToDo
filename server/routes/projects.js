const express = require("express");
const {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks,
  getProjectStats,
} = require("../services/projectService");

const router = express.Router();

router.get("/", (_req, res, next) => {
  try {
    const projects = listProjects();
    res.json({ projects });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", (req, res, next) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) {
      res.status(404).json({ error: "Project not found." });
      return;
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/tasks", (req, res, next) => {
  try {
    const tasks = getProjectTasks(req.params.id);
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
});

router.get("/:id/stats", (req, res, next) => {
  try {
    const stats = getProjectStats(req.params.id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

router.post("/", (req, res, next) => {
  try {
    const project = createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", (req, res, next) => {
  try {
    const updatedProject = updateProject(req.params.id, req.body);
    if (!updatedProject) {
      res.status(404).json({ error: "Project not found." });
      return;
    }
    res.json(updatedProject);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", (req, res, next) => {
  try {
    const deleted = deleteProject(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Project not found." });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
