const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const env = require("./config/env");
const routes = require("./routes");
const { errorHandler, notFound } = require("./middlewares/error.middleware");

const app = express();

// Core middleware
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (env.nodeEnv === "development") app.use(morgan("dev"));

// Serve uploaded images statically from the VPS disk
app.use(
  `/${env.upload.dir}`,
  express.static(path.resolve(process.cwd(), env.upload.dir)),
);

// Root + API
app.get("/", (_req, res) => res.send("Track Down server is running"));
app.use("/api", routes);

// 404 + central error handler (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
