/**
 * many to many map of
 * chain-id* ... *master key ... * chain type
 */

const TABLE_NAME = 'chain_key_map';

class ChainKeyMap {
  constructor(id, chain_id, master_key_id, chainType) {
    this.id = id;
    this.chain_id = chain_id;
    this.master_key_id = master_key_id;
    this.chainType = chainType;
  }
}

module.exports = {
  ChainKeyMap,
  TABLE_NAME,
};
