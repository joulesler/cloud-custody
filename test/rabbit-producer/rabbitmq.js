require('dotenv').config();
const amqp = require('amqplib');
const { createPool } = require('generic-pool');
const logger = require('../../src/lib/logger/config');
const ProcessingError = require('../../src/lib/errors/processing-error');

const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

const factory = {
  create: async () => await amqp.connect(rabbitmqUrl),
  destroy: async (connection) => await connection.close(),
};

const opts = {
  max: 10, // maximum size of the pool
  min: 2, // minimum size of the pool
};

let pool = createPool(factory, opts);

async function initializePool() {
  if (!pool) {
    try {
      pool = await createPool(factory, opts);
    } catch (err) {
      logger.error('Error initializing connection pool:', err);
      throw new ProcessingError('Error initializing connection pool');
    }
  }
}

async function sendToQueue(queueName, message) {
  await initializePool();
  const connection = await pool.acquire();
  try {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: false });
    if (typeof message === 'object') {
      message = JSON.stringify(message);
    }
    channel.sendToQueue(queueName, Buffer.from(message));
    logger.info(`Sent message: ${message}`);
    await channel.close();
  } catch (err) {
    logger.error('Error sending message to queue:', err);
    throw new ProcessingError('Error sending message to queue');
  } finally {
    await pool.release(connection);
  }
}

async function readFromQueue(callback) {
  await initializePool();
  const connection = await pool.acquire();
  try {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: false });
    logger.info(`Waiting for messages in ${queueName}. To exit press CTRL+C`);
    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        const messageContent = msg.content.toString();
        logger.info(` [x] Received ${messageContent} from ${queueName}`);
        try {
          messageContent = JSON.parse(messageContent);
        } catch (e) {
          // no-op
        }
        const { payload } = JSON.parse(messageContent);

        logger.info(`Received message: ${messageContent}`);
        try {
          callback(payload);
          channel.ack(msg);
        } catch (callbackError) {
          logger.error('Error in message processing callback:', callbackError);
          // Optionally, re-queue the message for later processing
        }
      }
    });
  } catch (err) {
    logger.error('Error reading message from queue:', err);
  } finally {
    // Optionally handle connection release on shutdown or specific errors
  }

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    try {
      logger.info('Closing RabbitMQ connection');
      await connection.close();
      process.exit(0);
    } catch (shutdownError) {
      logger.error('Error during shutdown:', shutdownError);
      process.exit(1);
    }
  });
}

module.exports = { sendToQueue, readFromQueue };
