const SafeProtocol = require('@safe-global/protocol-kit')
const safeAbi = require('../../../../abi/gnosis/exec-transaction.abi.json')
const Web3 = require('web3');
const { default: EthSafeTransaction } = require('@safe-global/protocol-kit/dist/src/utils/transactions/SafeTransaction');
const { TRANSACTION_SERVICES } = require('../transaction-mapping');
const { TRANSACTION_TYPE } = require('../../../lib/enums/chains');
const web3 = new Web3.Web3();
const hexUtils = require('../../../lib/hex');
const ValidationError = require('../../../lib/errors/validation-error');
const { BN } = require('ethereumjs-util');

const Operations = {
    Call: 0,
    DelegateCall: 1
};

const SAFE_TX_TYPEHASH = '0xbb8310d486368db6bd6f849402fdd73ad53d316b5a4b2644ad6efe0f941286d8';
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

async function encodeExecTransaction(to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken = '0x', refundReceiver, signatures) {
    // validations for input
    let estimateSafeTxGas = false;
    if (!to) {
        throw new ValidationError('to address is required')
    }
    if (!value) {
        throw new ValidationError('value is required')
    }
    // enum make sure its of the two values, DelegateCall or Call
    if (('number' !== typeof operation && !operation ) || (operation !== Operations.Call && operation !== Operations.DelegateCall)) {        
        throw new ValidationError('operation must be either DelegateCall or Call')
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
        throw new ValidationError('gasPrice is required')
    }

    const safeTxGasBN = hexUtils.numericalToBigInt(safeTxGas);
    const baseGasBN = hexUtils.numericalToBigInt(baseGas);
    const gasPriceBN = hexUtils.numericalToBigInt(gasPrice);
    const valueBN = hexUtils.numericalToBigInt(value);

    // Encode packed the signatures map into array
    const concatSignatures = Object.values(signatures).reduce((signatureAcc, signature) => {
        return signatureAcc + hexUtils.removeHexPrefix(signature.data);
    }, '0x');
    
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
async function addSignatureToSafeTransaction(ethSafeTransaction, ethSignSignature ) {
    // add signature to the map of signatures
    if (!ethSafeTransaction.signatures) {
        ethSafeTransaction.signatures = {}
    }
    // convert the object to map and set the signature
    ethSafeTransaction.signatures[ethSignSignature.signer] = ethSignSignature
    return ethSafeTransaction;
}

/**
 * @param {String} hash - The hash to be approved.
 * @param {String} masterKeyLabel
 * @param {derivationPath} derivationPath
 * @return {Map<String, SafeProtocol.EthSafeSignature>} - The signature of the hash.
 */
async function approveHash(hash, keyLabel, derivationPath){
    const { v, rawSignature, address } = await TRANSACTION_SERVICES[TRANSACTION_TYPE.EVM].signHash(keyLabel, null, derivationPath, hash, true); 

    // append the v to the signature
    const rawSignatureV = rawSignature + hexUtils.removeHexPrefix(v);

    const signature = await new SafeProtocol.EthSafeSignature(address, rawSignatureV, false);
    return {address, signature};
}

async function getTransactionHash(to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signatures) {
    const encodedTransaction = await encodeExecTransaction(to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signatures);
    return web3.utils.keccak256(encodedTransaction);
}

module.exports = {
    encodeExecTransaction,
    addSignatureToSafeTransaction,
    approveHash,
    Operations,
};
