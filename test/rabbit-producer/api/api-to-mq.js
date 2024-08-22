require('dotenv').config();
const { logger } = require('../../../src/lib/logger/config');
const { sendToQueue } = require('../../../src/lib/rabbitmq/connector');
module.exports.signHash = signHash;

async function signHash(app) {
  app.post('/transaction/rabbitmq/:endpoint', async (req, res) => {
    const { payload } = req.body;
    const queueName = req.params.endpoint;
    if (!payload) {
      return res.status(400).send('payload required');
    }

    try {
      await sendToQueue(queueName, payload);
      res.status(200).send(`Message sent to queue ${queueName}`);
    } catch (error) {
      logger.error('Error sending message to queue:', error);
      res.status(500).send('Error sending message to queue');
    }
  });

  return app;
};
