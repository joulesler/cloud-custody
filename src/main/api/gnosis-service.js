// take in gnosis fields and create data back
const { default: EthSafeTransaction } = require('@safe-global/protocol-kit/dist/src/utils/transactions/SafeTransaction');
const SafeProtocol = require('@safe-global/protocol-kit')

const ValidationError = require('../../lib/errors/validation-error');
const safe = require('../../main/handlers/gnosis-safe/safe');
/**
 * Function to onboard a chain
 * @param {*} app
 */
function gnosisData(app) {
    app.post('/gnosis/execTransaction', async (req, res) => {
        try {
            const { to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signatures } = req.body;

            if (!to) {
                throw new ValidationError('to address is required')
            }
            if (!value) {
                throw new ValidationError('value is required')
            }
            // enum make sure its of the two values, DelegateCall or Call
            if (!operation || operation !== SafeProtocol.Operations.Call && operation !== SafeProtocol.Operations.DelegateCall) {
                throw new ValidationError('operation must be either DelegateCall or Call')
            }
            if (!safeTxGas) {
                throw new ValidationError('safeTxGas is required')
            }
            if (!baseGas) {
                throw new ValidationError('baseGas is required')
            }
            if (!gasPrice) {
                throw new ValidationError('gasPrice is required')
            }

            const abiEncodeDdata = safe.encodeExecTransaction(to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signatures);

            res.json({ success: true, encodedData: abiEncodeDdata });
        } catch (error) {
            // Send the error response
            console.log(error);
            res.json({ success: false, error: error.message });
        }
    });
}

/**
 * @param {Object} req.body - The body of the request.
 * @param {EthSafeTransaction} req.body.ethSafeTransaction - The EthSafeTransaction object.
 * @param {SafeProtocol.EthSafeSignature} req.body.ethSignSignature - The EthSafeSignature object from SafeProtocol.
 */
function addSignature(app) {
    app.post('/gnosis/addSignature', async (req, res) => {
        try {
            const { ethSafeTransaction, ethSignSignature } = req.body;

            if (!ethSafeTransaction) {
                throw new ValidationError('ethSafeTransaction is required')
            }
            if (!ethSignSignature) {
                throw new ValidationError('ethSignSignature is required')
            }

            const safeTransaction = safe.addSignatureToSafeTransaction(ethSafeTransaction, ethSignSignature);

            res.json({ success: true, safeTransaction });
        } catch (error) {
            // Send the error response
            console.log(error);
            res.json({ success: false, error: error.message });
        }
    });
}

function approveHash(app) {
    app.post('/gnosis/approveHash', async (req, res) => {
        try {
            const { safeTxHash, masterKeyLabel, derivationPath } = req.body;
                
            if (!safeTxHash) {
                throw new ValidationError('safeTxHash is required')
            }

            const safeTransaction = safe.approveHash(safeTxHash, masterKeyLabel, derivationPath);
            res.json({ success: true, safeTransaction });
        } catch (error) {
            // Send the error response
            console.log(error);
            res.json({ success: false, error: error.message });
        }
    });
}

module.exports = { 
    gnosisData,
    addSignature,
    approveHash
 }
