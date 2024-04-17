require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Logger = require('../../lib/logger/config');
const { migrate } = require('../../lib/db/db');

const logger = new Logger();

/**
 * API Server, on port 8080 for development
 */
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

// Always run database migration prior to starting the application
migrate().then(() => {
  logger.info('Migrations run successfully');
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}).catch((err) =>  {
    logger.error('Could not setup database, please check db config')
    logger.error(err)
});
