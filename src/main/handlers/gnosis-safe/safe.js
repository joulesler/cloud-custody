const SafeProtocol = require('@safe-global/protocol-kit');
const Web3 = require('web3');
const safeAbi = require('../../../../abi/gnosis/exec-transaction.abi.json');
const { TRANSACTION_SERVICES } = require('../transaction-mapping');
const { TRANSACTION_TYPE } = require('../../../lib/enums/chains');

const web3 = new Web3.Web3();
const hexUtils = require('../../../lib/hex');
const ValidationError = require('../../../lib/errors/validation-error');

const Operations = {
  Call: 0,
  DelegateCall: 1,
};

// eslint-disable-next-line no-unused-vars
const SAFE_TX_TYPEHASH = '0xbb8310d486368db6bd6f849402fdd73ad53d316b5a4b2644ad6efe0f941286d8';

/**
 * @param {String} to - The address to send the transaction to.
 * @param {Number} value - The value to send in the transaction.
 * @param {String} data - The data to send in the transaction.
 * @param {Number} operation - The operation to perform in the transaction.
 * @param {Number} safeTxGas - The gas to send in the transaction.
 * @param {Number} baseGas - The base gas to send in the transaction.
 * @param {Number} gasPrice - The gas price to send in the transaction.
 * @param {String} gasToken - The gas token to send in the transaction.
 * @param {String} refundReceiver - The refund receiver to send in the transaction.
 * @param {Map<String, SafeProtocol.EthSafeSignature>} signatures - The signatures to send in the transaction.
 * Solidity Transaction Object
 *     function execTransaction(
        address to,
        uint256 value,
        bytes calldata data,
        Enum.Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes memory signatures
 * @returns {String} - The encoded transaction.
 */
async function encodeExecTransaction(to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken = '0x', refundReceiver, signatures) {
  // validations for input
  let estimateSafeTxGas = false;
  if (!to) {
    throw new ValidationError('to address is required');
  }
  if (!value) {
    throw new ValidationError('value is required');
  }
  // enum make sure its of the two values, DelegateCall or Call
  if ((typeof operation !== 'number' && !operation) || (operation !== Operations.Call && operation !== Operations.DelegateCall)) {
    throw new ValidationError('operation must be either DelegateCall or Call');
  }
  if (!safeTxGas) {
    safeTxGas = 0;
    estimateSafeTxGas = true;
  }
  if (!baseGas) {
    // Assume a normal ETH EOA transfer, cost of transfer + smart contract execution
    // baseGas = 35000;
    baseGas = 0;
  }
  if (!gasPrice && gasPrice !== 0) {
    throw new ValidationError('gasPrice is required');
  }

  const safeTxGasBN = hexUtils.numericalToBigInt(safeTxGas);
  const baseGasBN = hexUtils.numericalToBigInt(baseGas);
  const gasPriceBN = hexUtils.numericalToBigInt(gasPrice);
  const valueBN = hexUtils.numericalToBigInt(value);

  // Encode packed the signatures map into array
  const concatSignatures = Object.values(signatures).reduce((signatureAcc, signature) => signatureAcc + hexUtils.removeHexPrefix(signature.data), '0x');

  // Should not be needed
  // const dataBytes = hexUtils.hexStringToByteArray(data);
  // const signatureBytes = hexUtils.hexStringToByteArray(concatSignatures);

  return web3.eth.abi.encodeFunctionCall(safeAbi, [to, valueBN, data, operation, safeTxGasBN, baseGasBN, gasPriceBN, gasToken, refundReceiver, concatSignatures]);
}

/**
 *
 * @param {EthSafeTransaction} ethSafeTransaction
 * @param {SafeProtocol.EthSafeSignature} ethSignSignature
 */
async function addSignatureToSafeTransaction(ethSafeTransaction, ethSignSignature) {
  // add signature to the map of signatures
  if (!ethSafeTransaction.signatures) {
    ethSafeTransaction.signatures = {};
  }
  // convert the object to map and set the signature
  ethSafeTransaction.signatures[ethSignSignature.signer] = ethSignSignature;
  return ethSafeTransaction;
}

/**
 * @param {String} hash - The hash to be approved.
 * @param {String} masterKeyLabel
 * @param {derivationPath} derivationPath
 * @return {Map<String, SafeProtocol.EthSafeSignature>} - The signature of the hash.
 */
async function approveHash(hash, keyLabel, derivationPath) {
  const { v, rawSignature, address } = await TRANSACTION_SERVICES[TRANSACTION_TYPE.EVM].signHash(keyLabel, null, derivationPath, hash, true);

  // append the v to the signature
  const rawSignatureV = rawSignature + hexUtils.removeHexPrefix(v);

  const signature = await new SafeProtocol.EthSafeSignature(address, rawSignatureV, false);
  return { address, signature };
}

module.exports = {
  encodeExecTransaction,
  addSignatureToSafeTransaction,
  approveHash,
  Operations,
};
