require('dotenv').config();

const amqp = require('amqplib');
const crypto = require('crypto');
const { createPool } = require('generic-pool');
const logger = require('../logger/config');

const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
const responseQueue = process.env.RESPONSE_QUEUE_NAME || 'response';

const factory = {
  create: () => amqp.connect(rabbitmqUrl),
  destroy: (connection) => connection.close(),
};

const opts = {
  max: 20, // maximum size of the pool
  min: 10, // minimum size of the pool
};

const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;

async function validateSignature(signature, payload) {
  const verifier = crypto.createVerify('sha256');
  verifier.update(Buffer.from(payload, 'utf-8'));
  const isValid = verifier.verify(publicKey, signature, 'hex');
  return isValid;
}

async function signPayload(payload) {
  const signer = crypto.createSign('sha256');
  signer.update(Buffer.from(payload, 'utf-8'));
  const signature = signer.sign(privateKey, 'hex');
  return signature;
}

const pool = createPool(factory, opts);

async function sendToQueue(queueName, message, req_id) {
  const connection = await pool.acquire();
  try {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: false });

    // Sign the message
    if (typeof message === 'object') {
      message.req_id = req_id;
      message = JSON.stringify(message, null, 0);
    }
    const signature = await signPayload(message);
    const signedMessage = JSON.stringify({ payload: message, signature });

    channel.sendToQueue(queueName, Buffer.from(signedMessage, 'utf-8'));
    logger.info(` [x] Sent ${signedMessage} to ${queueName}`);
    await channel.close();
  } catch (err) {
    logger.error(`Error sending message to queue ${queueName}:`, err);
  } finally {
    pool.release(connection);
  }
}

async function readFromQueue(queueName, endpointMapping) {
  const connection = await pool.acquire();
  try {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: false });
    logger.info(` [*] Waiting for messages in ${queueName}. To exit press CTRL+C`);
    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        (async () => {
          let messageContent = msg.content.toString('utf-8');
          logger.info(` [x] Received ${messageContent} from ${queueName}`);
          try {
            messageContent = JSON.parse(messageContent);
          } catch (e) {
            // no-op
          }
          const { payload, signature, type } = messageContent;

          // Validate the signature
          const isValid = await validateSignature(signature, payload);
          if (!isValid) {
            logger.error('Invalid signature. Discarding message.');
            channel.reject(msg, false); // Reject and discard the message
            return;
          }

          const data = JSON.parse(payload);
          const { req_id } = data;
          try {
            // If using segregated queues, use the queue name as the endpoint
            // If using single queue, use the type as the endpoint (e.g. queueName = 'request', type = 'gen_xpub')
            if (endpointMapping[queueName] || endpointMapping[type]) {
              const endpoint = endpointMapping[queueName] ? endpointMapping[queueName] : endpointMapping[type];
              response = await endpoint(data);
              sendToQueue(responseQueue, response, req_id);
              channel.ack(msg); // Acknowledge the message
            } else {
              logger.error(`No handler registered for endpoint: ${endpoint}`);
              channel.reject(msg, false); // Reject and discard the message
            }
          } catch (err) {
            logger.error(`Error processing message: ${err}`);
            // Negative acknowledgment and requeue the message
            // If the message is requeued multiple times, it can be routed to the DLQ
            sendToQueue(responseQueue, { error: err.message, req_id });
            channel.nack(msg, false, false); // Send to DLQ
          }
        })();
      }
    });
  } catch (err) {
    logger.error(`Error reading message from queue ${queueName}:`, err);
  }
}

module.exports = { sendToQueue, readFromQueue };
