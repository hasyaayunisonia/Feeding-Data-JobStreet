const winston = require("winston");

const logger = winston.createLogger({
  level: "debug", // Level log default (error, warn, info, http, verbose, debug, silly)
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(), // Log ke console
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // Log error ke file
    new winston.transports.File({ filename: "logs/combined.log" }), // Log semua level ke file
  ],
});

module.exports = logger;
