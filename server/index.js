const express = require("express");
const path = require("node:path");
const fs = require("node:fs");
const tasksRouter = require("./routes/tasks");
const analyticsRouter = require("./routes/analytics");
const projectsRouter = require("./routes/projects");
const focusRouter = require("./routes/focus");
const journalRouter = require("./routes/journal");
const settingsRouter = require("./routes/settings");
const boardsRouter = require("./routes/boards");
const settingsService = require("./services/settingsService");

function createApp() {
  const app = express();

  app.use(express.json());
  
  settingsService.initializeSettings();

  app.use("/api/tasks", tasksRouter);
  app.use("/api/analytics", analyticsRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/focus", focusRouter);
  app.use("/api/journal", journalRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/boards", boardsRouter);

  const distPath = path.join(__dirname, "..", "web", "dist");
  
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    app.get("/", (_req, res) => {
      res.type("text/plain").send("TaskFlow API is running. Run 'npm run build:web' to build the frontend.");
    });
  }

  app.use((error, _req, res, _next) => {
    const statusCode = error.statusCode ?? 500;
    const message = error.message ?? "Internal server error";
    res.status(statusCode).json({ error: message });
  });

  return app;
}

function startServer({ port = 4010, host = "127.0.0.1" } = {}) {
  const app = createApp();

  return new Promise((resolve, reject) => {
    const server = app.listen(port, host);

    server.once("listening", () => {
      const address = server.address();
      const resolvedPort =
        typeof address === "string" ? port : (address?.port ?? port);

      resolve({
        app,
        server,
        url: `http://localhost:${resolvedPort}`,
      });
    });

    server.once("error", (error) => {
      reject(error);
    });
  });
}

if (require.main === module) {
  startServer()
    .then(({ url }) => {
      console.log(`TaskFlow API listening at ${url}`);
    })
    .catch((error) => {
      console.error(`Failed to start TaskFlow API: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  createApp,
  startServer,
};

