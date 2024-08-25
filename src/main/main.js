require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('../lib/logger/config');
const { migrate } = require('../lib/db/db');
const apiConfig = require('./oas.config');
/**
 * API Server, on port 8080 for development
 */
const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
require('./api/key-service').generateChildKey(app);
require('./api/key-service').generateKey(app);
require('./api/chain-service').getChainData(app);
require('./api/chain-service').onboardChain(app);
require('./api/transaction-service').signHash(app);
require('./api/transaction-service').signTransaction(app);
require('./api/gnosis-service').addSignature(app);
require('./api/gnosis-service').gnosisData(app);
require('./api/gnosis-service').approveHash(app);
require('./api/gnosis-service').getTransactionHash(app);

// Swagger UI
apiConfig(app);

// Test endpoints
if (process.env.NODE_ENV === 'test') {
  require('../../test/rabbit-producer/api/api-to-mq').signHash(app);
}

// MQ Endpoints
require('./mq/transaction-service');
require('./mq/key-service');
require('./mq/gnosis-service');

// health check
app.get('/health', (_, res) => {
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
app.use((err, req, res) => {
  logger.error(err);
  res.status(500).send('Internal Server Error');
});

module.exports = app;
