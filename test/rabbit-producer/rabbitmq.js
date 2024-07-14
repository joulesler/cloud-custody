require('dotenv').config();
const amqp = require('amqplib');
const { createPool } = require('generic-pool');

const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
const queueName = process.env.PRODUCER_QUEUE || 'default';

const factory = {
  create: () => amqp.connect(rabbitmqUrl),
  destroy: (connection) => connection.close(),
};

const opts = {
  max: 10, // maximum size of the pool
  min: 2, // minimum size of the pool
};

const pool = createPool(factory, opts);

async function sendToQueue(message) {
  const connection = await pool.acquire();
  try {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: false });
    channel.sendToQueue(queueName, Buffer.from(message));
    console.log(` [x] Sent ${message}`);
    await channel.close();
  } catch (err) {
    console.error('Error sending message to queue:', err);
  } finally {
    pool.release(connection);
  }
}

async function readFromQueue(callback) {
  const connection = await pool.acquire();
  try {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: false });
    console.log(` [*] Waiting for messages in ${queueName}. To exit press CTRL+C`);
    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        const messageContent = msg.content.toString();
        console.log(` [x] Received ${messageContent}`);
        callback(messageContent);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error('Error reading message from queue:', err);
  } finally {
    // Do not release the connection here as it is being used for consuming messages
  }
}

module.exports = { sendToQueue, readFromQueue };
