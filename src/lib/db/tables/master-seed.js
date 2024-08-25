const { db } = require('../db');

const TABLE_NAME = 'master_seed';

class MasterSeed {
  constructor({
    id, key_store_type, encrypted_seed, encrypting_key_label, encrypting_key_algo, x_pub_key, chain_code, key_type,
  }) {
    this.id = id;
    this.key_store_type = key_store_type;
    this.encrypted_seed = encrypted_seed;
    this.encrypting_key_label = encrypting_key_label;
    this.encrypting_key_algo = encrypting_key_algo;
    this.x_pub_key = x_pub_key;
    this.chain_code = chain_code;
    this.key_type = key_type;
  }
}

async function getKeyStoreTypeFromSeed(seed) {
  const keyStoreType = await db(TABLE_NAME)
    .where({ encrypted_seed: seed })
    .select('key_store_type')
    .first();
  return keyStoreType;
}

async function getKeyStoreTypeFromPubKey(xPubKey) {
  const keyStoreType = await db(TABLE_NAME)
    .where({ x_pub_key: xPubKey })
    .select('key_store_type')
    .first();
  return keyStoreType;
}

async function getKeyStoreTypeFromKeyLabel(encrypting_key_label) {
  const keyStoreType = await db(TABLE_NAME)
    .where({ encrypting_key_label })
    .select('key_store_type')
    .first();
  return keyStoreType;
}

module.exports = {
  MasterSeed,
  TABLE_NAME,
  getKeyStoreTypeFromSeed,
  getKeyStoreTypeFromPubKey,
  getKeyStoreTypeFromKeyLabel,
};
