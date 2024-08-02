// consumer.js
require('dotenv').config();
const { transactionSignature, hashSignature } = require('../api/transaction-service');
const { readFromQueue } = require('../../lib/rabbitmq/connector');

const endpointMapping = {
  signHash: hashSignature,
  signTransaction: transactionSignature,
};

Object.keys(endpointMapping).forEach((endpoint) => readFromQueue(endpoint, endpointMapping))