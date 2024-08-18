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

async function sendToQueue(queueName, message) {
    const connection = await pool.acquire();
    try {
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName, { durable: false });

        // Sign the message
        if (typeof message === 'object') {
            message = JSON.stringify(message, null, 0);
        }
        const signature = await signPayload(message);
        const signedMessage = JSON.stringify({ payload: message, signature });

        channel.sendToQueue(queueName, Buffer.from(signedMessage, 'utf-8'));
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
                    let messageContent = msg.content.toString('utf-8');
                    console.log(` [x] Received ${messageContent} from ${queueName}`);
                    try {
                        messageContent = JSON.parse(messageContent);
                    } catch (e) {
                        // no-op
                    }
                    const { payload, signature } = messageContent;

                    // Validate the signature
                    const isValid = await validateSignature(signature, payload);
                    if (!isValid) {
                        console.error('Invalid signature. Discarding message.');
                        channel.reject(msg, false); // Reject and discard the message
                        return;
                    }

                    const data = JSON.parse(payload);
                    const {txn_id } = data;
                    try {
                        if (endpointMapping[queueName]) {
                            response = await endpointMapping[queueName](data);
                            sendToQueue('response', response);
                            channel.ack(msg); // Acknowledge the message
                        } else {
                            console.error(`No handler registered for endpoint: ${endpoint}`);
                            channel.reject(msg, false); // Reject and discard the message
                        }
                    } catch (err) {
                        console.error(`Error processing message: ${err}`);
                        // Negative acknowledgment and requeue the message
                        // If the message is requeued multiple times, it can be routed to the DLQ
                        sendToQueue('response', { error: err.message, txn_id });
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