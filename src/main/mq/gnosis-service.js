// consumer.js
require('dotenv').config();
const { gnosisApproveHash, gnosisAddSignature, gnosisGetTransactionHash, gnosisTransaction} = require('../api/gnosis-service');
const { readFromQueue } = require('../../lib/rabbitmq/connector');

const endpointMapping = {
    approveHash: gnosisApproveHash,
    addSignature: gnosisAddSignature,
    getTransactionHash: gnosisGetTransactionHash,
    transaction: gnosisTransaction,
};

Object.keys(endpointMapping).forEach((endpoint) => readFromQueue(endpoint, endpointMapping))