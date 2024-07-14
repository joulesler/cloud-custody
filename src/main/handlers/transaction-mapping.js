const { TRANSACTION_TYPE } = require('../../lib/enums/chains');

const TRANSACTION_SERVICES = {
  [TRANSACTION_TYPE.EVM]: require('./evm/evm'),
};
module.exports = {
  TRANSACTION_SERVICES,
};
