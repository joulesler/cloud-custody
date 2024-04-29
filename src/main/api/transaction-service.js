const keyEnums = require('../../lib/enums/keys');
const serviceMapping = require('../handlers/transaction-mapping');
const masterSeed = require('../../lib/db/tables/master-seed');
const chainEnum = require('../../lib/enums/chains');


/**
 * 
 * @param {*} derivationPath Optional if using a non master key
 * @param {*} keyLabel The label of the key to be used for signing 
 * @param {*} transactionType The type of transaction to be signed (EVM, BTC)
 * @param {*} transaction The transaction to be signed e.g. 
 * { "gas": 21000, "gasPrice": 20000000000, "nonce": 1, "to": "0x1234567890123456789012345678901234567890", "value": 1000000000000000, "data": "0x" }
 */
function signTransaction(app) {
    app.post('/transaction/sign', async (req, res) => {
        try {
            // Get the chain id from the request
            const { keyLabel, transactionType, derivationPath, transaction } = req.body;

            if (chainEnum.TRANSACTION_TYPE[transactionType] === undefined) {
                throw new Error('Invalid transaction type');
            }

            if (!transaction) {
                throw new Error('transaction is required');
            }

            if (!keyLabel) {
                throw new Error('keyLabel is required');
            }

            const signature = await serviceMapping.TRANSACTION_SERVICES[transactionType].signTransaction(keyLabel, transaction, derivationPath);

            // Send the response
            res.json({ success: true, ...signature });
        } catch (error) {
            // Send the error response
            console.log(error);
            res.json({ success: false, error: error.message });
        }
    });
}

module.exports = signTransaction;
