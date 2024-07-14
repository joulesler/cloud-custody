require('dotenv').config();
const amqp = require('amqplib');
const { createPool } = require('generic-pool');

const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';

const factory = {
  create: () => amqp.connect(rabbitmqUrl),
  destroy: (connection) => connection.close(),
};

const opts = {
  max: 10, // maximum size of the pool
  min: 2, // minimum size of the pool
};

const pool = createPool(factory, opts);

async function sendToQueue(queueName, message) {
  const connection = await pool.acquire();
  try {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: false });
    channel.sendToQueue(queueName, Buffer.from(message));
    console.log(` [x] Sent ${message} to ${queueName}`);
    await channel.close();
  } catch (err) {
    console.error(`Error sending message to queue ${queueName}:`, err);
  } finally {
    pool.release(connection);
  }
}

async function readFromQueue(queueName, endpointMapping) {
  const connection = await pool.acquire();
  try {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: false });
    console.log(` [*] Waiting for messages in ${queueName}. To exit press CTRL+C`);
    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        (async () => {
          const messageContent = msg.content.toString();
          console.log(` [x] Received ${messageContent} from ${queueName}`);
          const { endpoint, data } = JSON.parse(messageContent);
          try {
            if (endpointMapping[endpoint]) {
              await endpointMapping[endpoint](data);
              channel.ack(msg); // Acknowledge the message
            } else {
              console.error(`No handler registered for endpoint: ${endpoint}`);
              channel.reject(msg, false); // Reject and discard the message
            }
          } catch (err) {
            console.error(`Error processing message: ${err}`);
            // Negative acknowledgment and requeue the message
            // If the message is requeued multiple times, it can be routed to the DLQ based on your RabbitMQ configuration
            channel.nack(msg, false, false); // Send to DLQ
          }
        })();
      }
    });
  } catch (err) {
    console.error(`Error reading message from queue ${queueName}:`, err);
  }
}

module.exports = { sendToQueue, readFromQueue };
