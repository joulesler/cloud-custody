require('dotenv').config();
const { sendToQueue } = require('../../../src/lib/rabbitmq/connector');
module.exports.signHash = signHash;

async function signHash(app) {
  if (process.env.NODE_ENV === 'test') {
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
        console.error('Error sending message to queue:', error);
        res.status(500).send('Error sending message to queue');
      }
    });

    return app;
  }
};
