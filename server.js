import express from "express";
import dotenv from "dotenv";
import http from "http";
import morgan from "morgan";
import pluginRoutes from "./plugin.router.js";
// import connectDB from './db.js'
const notFound = (req, res) => {
  // const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404);
  res.json({
    message: "url not found",
  });
};

dotenv.config();

// connectDB()

const app = express();
const server = http.createServer(app);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/plugins", pluginRoutes);
app.use(notFound);

server.listen(
  process.env.PORT || 3000,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${
      process.env.PORT || 3000
    }`
  )
);
