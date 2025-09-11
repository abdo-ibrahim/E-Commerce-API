const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const apiRoutes = require("./routes/apiRoutes");
const errorHandler = require("./utils/errorHandler");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");

const app = express();
app.use(cookieParser(process.env.JWT_SECRET_KEY));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
// Enhance security with various middleware
app.use(helmet());
const limiter = rateLimit({
  max: 100, // max requests
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Routes
app.use(apiRoutes);
app.all("*", (req, _, next) => {
  const err = new Error(`Can't Find ${req.originalUrl}`);
  err.status = "fail";
  err.statusCode = 404;
  err.isOperational = true;
  next(err);
});
app.use(errorHandler);
module.exports = app;
