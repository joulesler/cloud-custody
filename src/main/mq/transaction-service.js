// consumer.js
require('dotenv').config();
const { transactionSignature, hashSignature } = require('../api/transaction-service');
const { readFromQueue } = require('../../lib/rabbitmq/connector');

const endpointMapping = {
  signHash: hashSignature,
  signTransaction: transactionSignature,
  sign: async ({
    nw, mkl, d_path, sig_f, address, unsigned_tx_hash,
  }) => {
    // Convert nework name and sig_f (evm, btc etc) to chainName
    let chainName = '';
    if (nw === 't') {
      if (sig_f === 'evm') {
        chainName = 'sepolia';
      }
      if (sig_f === 'btc') {
        chainName = 'bitcoin_testnet';
      }
    } else if (nw === 'm') {
      if (sig_f === 'evm') {
        chainName = 'ethereum_mainnet';
      }
      if (sig_f === 'btc') {
        chainName = 'bitcoin_mainnet';
      }
    }

    if (!chainName) {
      throw new Error('Invalid Network');
      // option to sign without EIP155 if needed
      // chainName = false
    }
    const signature = await hashSignature({
      chainName,
      masterKeyLabel: mkl,
      derivationPath: d_path,
      hash: unsigned_tx_hash,
    });

    if (signature.success === false) {
      return { success: false, error: signature.error };
    }

    return {
      signed_tx: signature.rawSignature,
      address,
    };
  },
};

Object.keys(endpointMapping).forEach((endpoint) => readFromQueue(endpoint, endpointMapping));
readFromQueue(process.env.REQUEST_QUEUE_NAME, endpointMapping);
