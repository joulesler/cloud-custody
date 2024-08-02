// consumer.js
require('dotenv').config();
const { childKeyGeneration, keyGeneration } = require('../api/key-service');
const { readFromQueue } = require('../../lib/rabbitmq/connector');

const endpointMapping = {
  generateChildKey: childKeyGeneration,
  generateKey: keyGeneration,
};

Object.keys(endpointMapping).forEach((endpoint) => readFromQueue(endpoint, endpointMapping))
