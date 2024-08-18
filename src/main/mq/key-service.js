// consumer.js
require('dotenv').config();
const { childKeyGeneration, keyGeneration } = require('../api/key-service');
const { readFromQueue } = require('../../lib/rabbitmq/connector');

const endpointMapping = {
  generateChildKey: childKeyGeneration,
  generateKey: keyGeneration,
  
  // Backward Compatibility for HSM API
  gen_xpub:(nw, mkl, d_path) => {
    const childKey = childKeyGeneration({
      derivationPath: d_path, 
      masterKeyLabel: mkl, 
    });

    if (nw === 't') {
      childKey.accountXpub = childKey.accountXpub.replace('xpub', 'tpub');
    }
    // signature, type and req_id handled by queue processor
    return {
      hsm_id: process.env.HSM_ID,
      payload: {
        nw, 
        mkl,
        d_path,
        xpub: childKey.accountXpub,
      }
    }
  }
};

Object.keys(endpointMapping).forEach((endpoint) => readFromQueue(endpoint, endpointMapping))

// Register the services under a consolidated queue
readFromQueue(process.env.REQUEST_QUEUE_NAME, endpointMapping)