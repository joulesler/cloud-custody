require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('../../lib/logger/config');
const { migrate } = require('../../lib/db/db');

/**
 * API Server, on port 8080 for development
 */
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
require('./key-service').generateChildKey(app);
require('./key-service').generateKey(app);
require('./chain-service').getChainData(app);
require('./chain-service').onboardChain(app);
require('./transaction-service').signHash(app);
require('./transaction-service').signTransaction(app);
require('./gnosis-service').addSignature(app);
require('./gnosis-service').gnosisData(app);
require('./gnosis-service').approveHash(app);
require('./gnosis-service').getTransactionHash(app);

// Test endpoints
require('../../../test/rabbit-producer/api/api-to-mq').signHash(app);

// MQ Endpoints
require('../mq/transaction-service');
require('../mq/key-service');

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

// Always run database migration prior to starting the application
migrate().then(() => {
  logger.info('Migrations run successfully');
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  logger.error('Could not setup database, please check db config');
  logger.error(err);
});

// error handler
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).send('Internal Server Error');
});

module.exports = app;
