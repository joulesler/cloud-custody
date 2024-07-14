// consumer.js
require('dotenv').config();
const { transactionSignature, hashSignature } = require('../api/transaction-service');
const { readFromQueue } = require('../../lib/rabbitmq/connector');

const queueName = process.env.TRANSACTION_QUEUE_NAME || 'transaction-service';

const endpointMapping = {
  signHash: hashSignature,
  signTransaction: transactionSignature,
};

readFromQueue(queueName, endpointMapping);
