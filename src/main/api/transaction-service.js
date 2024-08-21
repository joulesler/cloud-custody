const serviceMapping = require('../handlers/transaction-mapping');
const chainConfig = require('../../lib/db/tables/chain-config');
const chainEnum = require('../../lib/enums/chains');
const ApiError = require('../../lib/errors/api-error');
const { logger } = require('../../lib/logger/config');

/**
 *
 * @param {*} derivationPath Optional if using a non master key
 * @param {*} keyLabel The label of the key to be used for signing
 * @param {*} transactionType The type of transaction to be signed (EVM, BTC)
 * @param {*} transaction The transaction to be signed e.g.
 * { "gas": 21000, "gasPrice": 20000000000, "nonce": 1, "to": "0x1234567890123456789012345678901234567890", "value": 1000000000000000, "data": "0x" }
 */
async function transactionSignature({masterKeyLabel, chainName, derivationPath, transaction}) {
  if (!chainName) {
    throw new Error('Chain name is required');
  }

  const chainData = await chainConfig.getChainByName(chainName);

  const transactionType = chainData.transaction_type;

  if (chainEnum.TRANSACTION_TYPE[transactionType] === undefined) {
    throw new Error('Invalid transaction type from chain name');
  }

  if (!transaction) {
    throw new Error('transaction is required');
  }

  if (!masterKeyLabel) {
    throw new Error('masterKeyLabel is required');
  }

  // Get the chainId from the database, using request transactionType
  const signature = await serviceMapping.TRANSACTION_SERVICES[transactionType]
    .signTransaction(masterKeyLabel, transaction, derivationPath, chainName);

  return signature;
}

async function hashSignature({masterKeyLabel, chainName, derivationPath, hash}) {
  if (!chainName) {
    throw new Error('Chain name is required');
  }

  const chainData = await chainConfig.getChainByName(chainName);

  const transactionType = chainData.transaction_type;

  if (chainEnum.TRANSACTION_TYPE[transactionType] === undefined) {
    throw new Error('Invalid transaction type from chain name');
  }

  if (!hash) {
    throw new Error('hash is required');
  }

  if (!masterKeyLabel) {
    throw new Error('masterKeyLabel is required');
  }

  // Get the chainId from the database, using request transactionType
  const signature = await serviceMapping.TRANSACTION_SERVICES[transactionType]
    .signHash(masterKeyLabel, chainName, derivationPath, hash);

  return signature;
}

function signTransaction(app) {
  app.post('/transaction/sign', async (req, res) => {
    try {
      const {
        masterKeyLabel, chainName, derivationPath, transaction,
      } = req.body;

      if (!masterKeyLabel) {
        throw new ApiError('masterKeyLabel is required');
      }

      if (!chainName) {
        throw new ApiError('chainName is required');
      }

      if (!transaction) {
        throw new ApiError('transaction is required');
      }

      const signature = await transactionSignature({masterKeyLabel, chainName, derivationPath, transaction});

      res.json({ success: true, signature });
    } catch (error) {
      logger.error(error);
      res.json({ success: false, error: error.message });
    }
  });
}

function signHash(app) {
  app.post('/transaction/signHash', async (req, res) => {
    try {
      const {
        masterKeyLabel, chainName, derivationPath, hash,
      } = req.body;

      if (!masterKeyLabel) {
        throw new ApiError('masterKeyLabel is required');
      }

      if (!chainName) {
        throw new ApiError('chainName is required');
      }

      if (!hash) {
        throw new ApiError('hash is required');
      }

      const signature = await hashSignature({masterKeyLabel, chainName, derivationPath, hash});

      res.json({ success: true, signature });
    } catch (error) {
      logger.error(error);
      res.json({ success: false, error: error.message });
    }
  });
}

module.exports = {
  signTransaction,
  signHash,
  transactionSignature,
  hashSignature,
};
