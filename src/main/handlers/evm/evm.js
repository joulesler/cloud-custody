const ethereumJs = require('ethereumjs-tx');
const { HDKey } = require('@scure/bip32');

const serviceMapping = require('../service-mapping');
const masterSeedInterface = require('../../../lib/db/tables/master-seed');
const chainConfig = require('../../../lib/db/tables/chain-config')
const { rlp, keccak } = require('ethereumjs-util');
const { signHash } = require('../../../lib/crypto/secp256k1')
const hexUtils = require('../../../lib/hex');

async function signTransaction(keyLabel, transaction, derivationPath, chainName) {
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
        // get chain from db
        const chainData = await chainConfig.getChainByName(chainName);

        if (!Number.isInteger(chainData.public_chain_identifier)){
            chainData.public_chain_identifier = Number(chainData.public_chain_identifier)
        }

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

        const EthereumTx = ethereumJs.Transaction

        const rlpTx = new EthereumTx({
            gas: gas,
            gasPrice: gasPrice,
            nonce: nonce,
            to: to,
            value: value,
            data: data,
        });

        const unsignedTxHash = rlpTx.hash(false);
        
        const { r, s, v } = signHash(childKey.privateKey, unsignedTxHash, chainData.public_chain_identifier);

        const signedTransaction = {
            ... rlpTx.toJSON(true),
            r,
            s,
            v
        }

        const serializedTransaction = rlp.encode(signedTransaction);
        const signedTxHash = keccak(serializedTransaction);

        return { transaction: signedTransaction, txForBroadcast: serializedTransaction, signedTxHash: hexUtils.byteToHexString(signedTxHash)};

    } catch (error) {
        throw error;
    }
}

module.exports = {
    signTransaction,
}