const winston = require('winston');

class Logger {
  constructor() {
    if (!Logger.instance) {
      this.logger = winston.createLogger({
        level: 'info', // Change as needed
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
        ),
        transports: [
          new winston.transports.Console(),
          // Add more transports as needed, e.g., file, HTTP, etc.
        ],
      });
      Logger.instance = this;
    }

    return Logger.instance;
  }

  info(message) {
    this.logger.info(message);
  }

  warn(message) {
    this.logger.warn(message);
  }

  error(message) {
    this.logger.error(message);
  }

  // You can add more methods for different log levels as needed
}

module.exports = new Logger();