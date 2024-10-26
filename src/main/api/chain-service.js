const { db } = require('../../lib/db/db');
const logger = require('../../lib/logger/config');
const { KEY_ALGO } = require('../../lib/enums/keys');
const { TRANSACTION_TYPE } = require('../../lib/enums/chains');
const { Chains, TABLE_NAME, getChainByPubId } = require('../../lib/db/tables/chain-config');

// Define the endpoint to onboard a chainId
/**
 *
 * @param {string} chain_name
 * @param {string} public_chain_identifier
 * @param {require('../../lib/enums/keys').KEY_ALGO} key_algo
 *
 * sample request body:
 * {
 *    "chain_name": "BTC",
 *    "public_chain_identifier": "bitcoin",
 *    "key_algo": "SECP256K1"
 *    "seed_length" : e.g. 64 bytes (512 bit seed),
 *    "transaction_type" : EVM/ BTC/ SOL
 * }
 */
function onboardChain(app) {
  app.post('/chain/onboard', async (req, res) => {
    const {
      chainName: chain_name,
      publicChainIdentifier: public_chain_identifier,
      keyAlgo: key_algo,
      transactionType: transaction_type,
      seedLength: seed_length,
    } = req.body;

    // Validate the request body
    if (!chain_name || !public_chain_identifier || !key_algo || !KEY_ALGO[key_algo] || !transaction_type || !TRANSACTION_TYPE[transaction_type]) {
      res.status(400).json({ message: 'Invalid request body' });
      return;
    }

    if (!KEY_ALGO[key_algo]) {
      res.status(400).json({ message: `Key algo must be of type: ${Object.keys(KEY_ALGO).join(',')}` });
      return;
    }

    // Check if the chainId already exists
    const chainData = await getChainByPubId(public_chain_identifier);
    if (chainData) {
      res.status(409).json({ message: 'ChainId already exists' });
      return;
    }

    try {
      const chain = new Chains({
        chain_name, public_chain_identifier, key_algo, seed_length, transaction_type,
      });
      // Save the chainId to the 'chain_config' table
      await db(TABLE_NAME).insert(chain);
      res.status(200).json({ message: 'ChainId onboarded successfully' });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

function getChainData(app) {
  app.get('/chain/:chainId', async (req, res) => {
    const { chainId } = req.params;

    try {
      // Retrieve the chain data from the 'chain_config' table
      if (chainId) {
        const chainData = await db(TABLE_NAME).where({ public_chain_identifier: chainId }).first();

        if (chainData) {
          res.status(200).json(chainData);
        } else {
          res.status(404).json({ message: 'Chain data not found' });
        }
      } else {
        const allChainData = await db(TABLE_NAME).select();
        res.status(200).json(allChainData);
      }
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

module.exports = {
  onboardChain,
  getChainData,
};
