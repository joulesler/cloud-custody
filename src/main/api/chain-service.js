const { Chains, TABLE_NAME } = require('../../lib/db/tables/chain-config');
const { db } = require('../../lib/db/db');
const { KEY_ALGO } = require('../../lib/enums/keys');

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
 * }
 */
function onboardChain(app) {
  app.post('/chain/onboard', async (req, res) => {
    const { chain_name, public_chain_identifier, key_algo } = req.body;

    // Validate the request body
    if (!chain_name || !public_chain_identifier || !key_algo || !KEY_ALGO[key_algo]) {
      res.status(400).json({ message: 'Invalid request body' });
      return;
    }

    if (!KEY_ALGO[key_algo]) {
      res.status(400).json({ message: `Key algo must be of type: ${Object.keys(KEY_ALGO).join(',')}` });
      return;
    }

    try {
      const chain = new Chains({ chain_name, public_chain_identifier, key_algo });
      // Save the chainId to the 'chain_config' table
      await db(TABLE_NAME).insert(chain);
      res.status(200).json({ message: 'ChainId onboarded successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

module.exports = onboardChain;
