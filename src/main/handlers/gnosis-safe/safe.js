const SafeProtocol = require('@safe-global/protocol-kit')
const safeAbi = require('../../../../abi/gnosis/transaction.abi.json')
const Web3 = require('web3')

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


const web3 = new Web3();

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

export default encodeExecTransaction;