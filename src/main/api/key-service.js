const keyEnums = require('../../lib/enums/keys');
const serviceMapping = require('../handlers/transaction-mapping');
const masterSeed = require('../../lib/db/tables/master-seed');

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

function generateChildKey(app) {
  app.post('/key/child', async (req, res) => {
    try {
      // Get the chain id from the request
      const { derivationPath, masterKeyLabel, xPubKey } = req.body;

      if (masterKeyLabel && xPubKey) {
        throw new Error('Only one of masterKeyLabel or xPubKey should be provided');
      }

      if (!derivationPath) {
        throw new Error('derivationPath is required');
      }

      if (!masterKeyLabel && !xPubKey) {
        throw new Error('Either masterKeyLabel or xPubKey is required');
      }

      let keyData;

      if (masterKeyLabel) { keyData = await masterSeed.getKeyStoreTypeFromLabel(masterKeyLabel); }
      if (xPubKey) { keyData = await masterSeed.getKeyStoreTypeFromPubKey(xPubKey); }

      const kmsType = keyData.key_store_type;

      if (!kmsType) {
        throw new Error('kmsType not found');
      }
      // Generate the master key pair
      const keyPair = await serviceMapping.KEY_SERVICES[kmsType].deriveChildKey(derivationPath, { masterKeyLabel, xPubKey });

      // Send the response
      res.json({ success: true, keyPair });
    } catch (error) {
      // Send the error response
      console.log(error);
      res.json({ success: false, error: error.message });
    }
  });
}

module.exports = {
  generateKey,
  generateChildKey,
};
