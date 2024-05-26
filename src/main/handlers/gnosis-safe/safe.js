const SafeProtocol = require('@safe-global/protocol-kit')
const safeAbi = require('../../../../abi/gnosis/exec-transaction.abi.json')
const Web3 = require('web3');
const { default: EthSafeTransaction } = require('@safe-global/protocol-kit/dist/src/utils/transactions/SafeTransaction');
const { TRANSACTION_SERVICES } = require('../transaction-mapping');
const { TRANSACTION_TYPE } = require('../../../lib/enums/chains');
const web3 = new Web3();
const hexUtils = require('../../../lib/hex');

/**
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
 */

function encodeExecTransaction(to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken = '0x', refundReceiver, signatures) {
    // validations for input
    if (!to) {
        throw new Error('to address is required')
    }
    if (!value) {
        throw new Error('value is required')
    }
    // enum make sure its of the two values, DelegateCall or Call
    if (!operation || operation !== SafeProtocol.Operations.Call && operation !== SafeProtocol.Operations.DelegateCall) {
        throw new Error('operation must be either DelegateCall or Call')
    }
    if (!safeTxGas) {
        throw new Error('safeTxGas is required')
    }
    if (!baseGas) {
        throw new Error('baseGas is required')
    }
    if (!gasPrice) {
        throw new Error('gasPrice is required')
    }

    return web3.eth.abi.encodeFunctionCall(safeAbi, [to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signatures])
}

/**
 * 
 * @param {EthSafeTransaction} ethSafeTransaction
 * @param {SafeProtocol.EthSafeSignature} ethSignSignature 
 */
function addSignatureToSafeTransaction(ethSafeTransaction, ethSignSignature ) {
    // add signature to the map of signatures
    if (!ethSafeTransaction.signatures) {
        ethSafeTransaction.signatures = new Map()
    }
    ethSafeTransaction.signatures.set(ethSignSignature.signer, ethSignSignature)
    return ethSafeTransaction;
}

/**
 * @param {String} hash - The hash to be approved.
 * @param {String} masterKeyLabel
 * @param {derivationPath} derivationPath
 * @return {Map<String, SafeProtocol.EthSafeSignature>} - The signature of the hash.
 */
function approveHash(hash, keyLabel, derivationPath){
    const { rawSignature, address } = TRANSACTION_SERVICES[TRANSACTION_TYPE.EVM].signHash(keyLabel, null, derivationPath, hash, true);
    const signature = new SafeProtocol.EthSafeSignature(address, hexUtils.byteToHexString(rawSignature));
    return new Map().set(address, signature);
}

module.exports = {
    encodeExecTransaction,
    addSignatureToSafeTransaction,
    approveHash,
};
