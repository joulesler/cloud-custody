require('dotenv').config();

const amqp = require('amqplib');
const crypto = require('crypto');
const { createPool } = require('generic-pool');
const logger = require('../logger/config');
const { v4 } = require('uuid');

const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
const responseQueue = process.env.RESPONSE_QUEUE_NAME || 'response';

// Singlelton pool instance
/**
 * @type {import('generic-pool').Pool<import('amqplib').Connection>}
 */
let pool;

const endpoints = {};

const factory = {
  create: () => amqp.connect(rabbitmqUrl),
  destroy: (connection) => connection.close(),
};

const opts = {
  max: 20, // maximum size of the pool
  min: 10, // minimum size of the pool
  acquireTimeoutMillis: 10 * 1000, // maximum time to wait for a resource
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

function getPool() {
  if (!pool) {
    logger.info('Creating RabbitMQ connection pool');
    pool = createPool(factory, opts);
    pool.start();
    pool.ready().then(() => {
      logger.info('RabbitMQ connection pool ready');
    }).catch((err) => {
      logger.error('Error creating RabbitMQ connection pool:', err);
      process.exit(1);
    });
  }
  return pool;
}

/**
 * 
 * @param {string} queueName - The name of the queue to which the message will be sent.
 * @param {Object} message - The message to be sent to the queue.
 * @param {string} message.type - The type of the message.
 * @param {Object} message.payload - The payload of the message.
 * @param {string} [req_id=v4()] - The request ID, defaults to a new UUID if not provided.
 */
async function sendToQueue(queueName, message, req_id = v4()) {
  const connection = await pool.acquire();
  try {
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });

    let toSign;

    message.payload.req_id = req_id;
    toSign = JSON.stringify(message.payload, null, 0);

    const signature = await signPayload(toSign);
    const signedMessage = JSON.stringify({ ...message, signature });

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
    if (endpoints[queueName]) {
      Object.assign(endpoints[queueName], endpointMapping);
      // Add the new endpoints to the existing mapping
      Object.assign(endpointMapping, endpoints[queueName]);
    } else {
      endpoints[queueName] = endpointMapping;
    }
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
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
          logger.info(` [x] Type ${type} from ${queueName}`);
          // Validate the signature
          let isValid;
          try {
            isValid = await validateSignature(signature, JSON.stringify(payload));
          } catch (err) {
            logger.error('Could not process message:', err);
            channel.reject(msg, false); // Reject and discard the message
            return;
          }
          if (!isValid) {
            logger.error('Invalid signature. Discarding message.');
            channel.reject(msg, false); // Reject and discard the message
            return;
          }

          const { req_id } = payload;
          let response = {};
          try {
            // If using segregated queues, use the queue name as the endpoint (e.g. queueName = 'signHash')
            // If using single queue, use the type as the endpoint (e.g. queueName = 'request', type = 'gen_xpub')
            if (endpointMapping[queueName] || endpointMapping[type]) {
              const endpoint = endpointMapping[queueName] ? endpointMapping[queueName] : endpointMapping[type];
              response = await endpoint(payload);
              sendToQueue(responseQueue, response, req_id);
              channel.ack(msg); // Acknowledge the message
            } else {
              logger.error(`No handler registered for either queue: ${queueName} or type ${type}`);
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

module.exports = { sendToQueue, readFromQueue, getPool };
