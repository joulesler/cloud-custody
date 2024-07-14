require('dotenv').config();
const amqp = require('amqplib');
const { createPool } = require('generic-pool');
const crypto = require('crypto');

const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost';

const factory = {
    create: () => amqp.connect(rabbitmqUrl),
    destroy: (connection) => connection.close(),
};

const opts = {
    max: 10, // maximum size of the pool
    min: 2, // minimum size of the pool
};

const privateKey = process.env.PRIVATE_KEY;
const publicKey = process.env.PUBLIC_KEY;

async function validateSignature(signature, payload) {
    const verifier = crypto.createVerify('sha256');
    verifier.update(payload);
    const isValid = verifier.verify(publicKey, signature, 'hex');
    return isValid;
}

async function signPayload(payload) {
    const signer = crypto.createSign('sha256');
    signer.update(payload);
    const signature = signer.sign(privateKey, 'hex');
    return signature;
}

const pool = createPool(factory, opts);

async function sendToQueue(queueName, message) {
    const connection = await pool.acquire();
    try {
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName, { durable: false });

        // Sign the message
        const signature = await signPayload(message);
        const signedMessage = JSON.stringify({ payload: message, signature });

        channel.sendToQueue(queueName, Buffer.from(signedMessage));
        console.log(` [x] Sent ${signedMessage} to ${queueName}`);
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
                    const { payload, signature } = JSON.parse(messageContent);

                    // Validate the signature
                    const isValid = await validateSignature(signature, payload);
                    if (!isValid) {
                        console.error('Invalid signature. Discarding message.');
                        channel.reject(msg, false); // Reject and discard the message
                        return;
                    }

                    const { endpoint, data } = JSON.parse(payload);
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