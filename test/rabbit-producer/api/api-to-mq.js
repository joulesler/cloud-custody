require('dotenv').config();
require('../../../src/main/api/main');
const { sendToQueue } = require('../rabbitmq');

module.exports.signHash = async (app) => {
  if (NODE_ENV === 'test') {
    app.post('/transaction/signHash/rabbitmq', async (req, res) => {
      const { queueName, message } = req.body;

      if (!queueName || !message) {
        return res.status(400).send('queueName and message are required');
      }

      try {
        await sendToQueue(queueName, message);
        res.status(200).send(`Message sent to queue ${queueName}`);
      } catch (error) {
        console.error('Error sending message to queue:', error);
        res.status(500).send('Error sending message to queue');
      }
    });

    return app;
  }
};
