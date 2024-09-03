const keyEnums = require('../../lib/enums/keys');
const serviceMapping = require('../handlers/service-mapping');
const masterSeed = require('../../lib/db/tables/master-seed');
const ValidationError = require('../../lib/errors/validation-error');
const { logger } = require('../../lib/logger/config');

async function keyGeneration({
  chainId, isMasterKey, keyType, kmsType,
}) {
  try {
    // Validate body
    if (!chainId) {
      throw new ValidationError('chainId is required');
    }
    // Validate kmsType
    if (!keyType || !keyEnums.KEY_REFERENCE_TYPE[keyType]) {
      throw new ValidationError(`Valid keyType ${Object.keys(keyEnums.KEY_REFERENCE_TYPE)} is required`);
    }

    if (!kmsType || !keyEnums.SUPPORTED_KMS[kmsType]) {
      throw new ValidationError(`Valid kmsType ${Object.keys(keyEnums.SUPPORTED_KMS)} is required`);
    }

    // Generate the master key pair
    const keyPair = await serviceMapping.KEY_SERVICES[kmsType].generateKey(isMasterKey, chainId);

    // Send the response
    return { success: true, keyPair };
  } catch (error) {
    // Send the error response
    return { success: false, error: error.message };
  }
}

async function childKeyGeneration({ derivationPath, masterKeyLabel, xPubKey }) {
  logger.info('Recieved request to generate child key: ', { derivationPath, masterKeyLabel, xPubKey });
  try {
    if (masterKeyLabel && xPubKey) {
      throw new ValidationError('Only one of masterKeyLabel or xPubKey should be provided');
    }

    if (!derivationPath) {
      throw new ValidationError('derivationPath is required');
    }

    if (!masterKeyLabel && !xPubKey) {
      throw new ValidationError('Either masterKeyLabel or xPubKey is required');
    }

    let keyData;

    if (masterKeyLabel) { keyData = await masterSeed.getKeyStoreTypeFromKeyLabel(masterKeyLabel); }
    if (xPubKey) { keyData = await masterSeed.getKeyStoreTypeFromPubKey(xPubKey); }

    const kmsType = keyData.key_store_type;

    if (!kmsType) {
      throw new ValidationError('kmsType not found');
    }
    // Generate the master key pair
    const keyPair = await serviceMapping.KEY_SERVICES[kmsType].deriveChildKey(derivationPath, { masterKeyLabel, xPubKey });

    // Send the response
    return { success: true, keyPair };
  } catch (error) {
    logger.error('Unable to generate child key: ', error);
    // Send the error response
    return { success: false, error: error.message };
  }
}

/**
 * <h> Generate a master key pair for a chain </h>
 * <p> This is a POST request that generates a master key pair for a chain. </p>
 * <p> Each key has a correspoinding key stored on the aws kms and the encrypted seed is stored in the database. </p>
 * @param {string} kmsType - The type of the kms to be used (awsKms, localKms, cloudHsm, utimaco)
 * @param {string} chainId - The chain id for which the master key pair is to be generated
 *
 */
function generateKey(app) {
  app.post('/key/generate', async (req, res) => {
    try {
      // Get the chain id from the request
      const {
        chainId, isMasterKey, keyType, kmsType,
      } = req.body;

      // Validate body
      if (!chainId) {
        res.status(400).json({ success: false, error: 'chainId is required' });
        return;
      }
      // Validate kmsType
      if (!keyType || !keyEnums.KEY_REFERENCE_TYPE[keyType]) {
        res.status(400).json({ success: false, error: `Valid keyType ${Object.keys(keyEnums.KEY_REFERENCE_TYPE)} is required` });
        return;
      }

      if (!kmsType || !keyEnums.SUPPORTED_KMS[kmsType]) {
        res.status(400).json({ success: false, error: `Valid kmsType ${Object.keys(keyEnums.SUPPORTED_KMS)} is required` });
        return;
      }

      // Generate the master key pair
      const keyPair = await serviceMapping.KEY_SERVICES[kmsType].generateKey(isMasterKey, chainId);

      // Send the response
      res.json({ success: true, keyPair });
    } catch (error) {
      // Send the error response
      res.json({ success: false, error: error.message });
    }
  });
}

/**
 *
 * @param {import('express').Express} app
 * @returns {import('express').Express}
 */
function generateChildKey(app) {
  app.post('/key/child', async (req, res) => {
    try {
      // Get the chain id from the request
      const { derivationPath, masterKeyLabel, xPubKey } = req.body;

      if (masterKeyLabel && xPubKey) {
        throw new ValidationError('Only one of masterKeyLabel or xPubKey should be provided');
      }

      if (!derivationPath) {
        throw new ValidationError('derivationPath is required');
      }

      if (!masterKeyLabel && !xPubKey) {
        throw new ValidationError('Either masterKeyLabel or xPubKey is required');
      }

      let keyData;

      if (masterKeyLabel) { keyData = await masterSeed.getKeyStoreTypeFromKeyLabel(masterKeyLabel); }
      if (xPubKey) { keyData = await masterSeed.getKeyStoreTypeFromPubKey(xPubKey); }

      const kmsType = keyData.key_store_type;

      if (!kmsType) {
        throw new ValidationError('kmsType not found');
      }
      // Generate the master key pair
      const keyPair = await serviceMapping.KEY_SERVICES[kmsType].deriveChildKey(derivationPath, { masterKeyLabel, xPubKey });

      // Send the response
      res.json({ success: true, keyPair });
    } catch (error) {
      // Send the error response
      logger.error(error);
      res.json({ success: false, error: error.message });
    }
  });

  return app;
}

module.exports = {
  generateKey,
  generateChildKey,
  keyGeneration,
  childKeyGeneration,
};
