const EthereumTx = require('ethereumjs-tx').Transaction;
const { HDKey } = require('@scure/bip32');

const serviceMapping = require('../service-mapping');
const masterSeedInterface = require('../../../lib/db/tables/master-seed');
const { rlp } = require('ethereumjs-util');

async function signTransaction(keyLabel, transaction, derivationPath) {
    const {
        gas,
        gasPrice,
        nonce,
        to,
        value,
        data,
    } = transaction;

    // validate the transaction
    if (!gas || !gasPrice || !nonce || !to || !value || !data) {
        throw new Error('Invalid transaction');
    }

    try {
        // Get the master seed
        const masterSeedData = await masterSeedInterface.getKeyStoreTypeFromKeyLabel(keyLabel);
        console.log(masterSeedData)
        if (!masterSeedData
            || !masterSeedData.key_store_type) {
            throw new Error('Invalid key label');
        }

        const keyStoreType = masterSeedData.key_store_type;

        const { masterSeed } = await serviceMapping.KEY_SERVICES[keyStoreType].getMasterSeed(keyLabel);

        const masterSeedUtf8Array = Buffer.from(masterSeed, 'hex');
        const hdkey = HDKey.fromMasterSeed(masterSeedUtf8Array);
        const childKey = hdkey.derive(derivationPath);

        const rlpTx = new EthereumTx({
            gas: gas,
            gasPrice: gasPrice,
            nonce: nonce,
            to: to,
            value: value,
            data: data,
        });

        rlpTx.sign(childKey.privateKey);
        

        // const signature = childKey.sign(rlpTx.hash(false));
        // const signatureHex = Array.from(signature).map((byte) => byte.toString(16).padStart(2, '0')).join('');

        return { transaction: rlpTx.toJSON(), txForBroadcast: rlpTx.raw };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    signTransaction,
}