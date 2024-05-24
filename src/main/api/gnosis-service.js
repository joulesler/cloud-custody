// take in gnosis fields and create data back
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

            const abiEncodeDdata = safe(to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signatures);

            res.json({ success: true, encodedData: abiEncodeDdata });
        } catch (error) {
            // Send the error response
            console.log(error);
            res.json({ success: false, error: error.message });
        }
    });
}

module.exports = gnosisData;
