const TABLE_NAME = 'chain_config';
const { db } = require('../db');

class Chains {
  constructor({
    id, chain_name, public_chain_identifier, key_algo, seed_length,
  }) {
    this.id = id;
    this.chain_name = chain_name;
    this.public_chain_identifier = public_chain_identifier;
    this.key_algo = key_algo;
    this.seed_length = seed_length;
  }
}

async function getChainByPubId(public_chain_identifier) {
  const chain = await db(TABLE_NAME)
    .where({ public_chain_identifier })
    .select('*')
    .first();
  return chain;
}

module.exports = {
  Chains,
  TABLE_NAME,
  getChainByPubId,
};
