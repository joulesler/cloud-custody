const keyEnums = require('../../lib/enums/keys');
const serviceMapping = require('../handlers/transaction-mapping');
const masterSeed = require('../../lib/db/tables/master-seed');
const chainConfig = require('../../lib/db/tables/chain-config')
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
            const { masterKeyLabel, chainName, derivationPath, transaction } = req.body;

            if (!chainName) {
                throw new Error('Chain name is required')
            }

            const chainData = await chainConfig.getChainByName(chainName);

            const transactionType = chainData.transaction_type;

            if (chainEnum.TRANSACTION_TYPE[transactionType] === undefined) {
                throw new Error('Invalid transaction type from chain name');
            }

            if (!transaction) {
                throw new Error('transaction is required');
            }

            if (!masterKeyLabel) {
                throw new Error('masterKeyLabel is required');
            }


            // Get the chainId from the database, using request transactionType
            const signature = await serviceMapping.TRANSACTION_SERVICES[transactionType]
                .signTransaction(masterKeyLabel, transaction, derivationPath, chainName);

            // Send the response
            res.json({ success: true, ...signature });
        } catch (error) {
            // Send the error response
            console.log(error);
            res.json({ success: false, error: error.message });
        }
    });
}

function signHash (app) {
    app.post('/transaction/signHash', async (req, res) => {
        try {
            // Get the chain id from the request
            const { masterKeyLabel, chainName, derivationPath, hash } = req.body;

            if (!chainName) {
                throw new Error('Chain name is required')
            }

            const chainData = await chainConfig.getChainByName(chainName);

            const transactionType = chainData.transaction_type;

            if (chainEnum.TRANSACTION_TYPE[transactionType] === undefined) {
                throw new Error('Invalid transaction type from chain name');
            }

            if (!hash) {
                throw new Error('hash is required');
            }

            if (!masterKeyLabel) {
                throw new Error('masterKeyLabel is required');
            }

            // Get the chainId from the database, using request transactionType
            const signature = await serviceMapping.TRANSACTION_SERVICES[transactionType]
                .signHash(masterKeyLabel, hash, derivationPath, chainName);

            // Send the response
            res.json({ success: true, signature });
        } catch (error) {
            // Send the error response
            console.log(error);
            res.json({ success: false, error: error.message });
        }
    });
}

module.exports = {
    signTransaction,
    signHash,
};
