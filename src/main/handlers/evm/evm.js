const { HDKey } = require('@scure/bip32');

const serviceMapping = require('../service-mapping');
const masterSeedInterface = require('../../../lib/db/tables/master-seed');
const chainConfig = require('../../../lib/db/tables/chain-config')
const { rlp, keccak } = require('ethereumjs-util');
const { signHash: regularSignHash, gnosisSignHash, publicKeyToEthAddress } = require('../../../lib/crypto/secp256k1')
const hexUtils = require('../../../lib/hex');
const ValidationError = require('../../../lib/errors/validation-error');
const CustodyError = require('../../../lib/errors/custody-error');
const ProcessingError = require('../../../lib/errors/processing-error');
const Logger = require('../../../lib/logger/config');

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
    if (!gas || !gasPrice || (!nonce && nonce !==0) || !to || (!value && value !==0)) {
        throw new ValidationError('Invalid transaction');
    }

try {
        // get chain from db
        const chainData = await chainConfig.getChainByName(chainName);

        if (!Number.isInteger(chainData.public_chain_identifier)){
            chainData.public_chain_identifier = Number(chainData.public_chain_identifier)
        }

        // Get the master seed
        const masterSeedData = await masterSeedInterface.getKeyStoreTypeFromKeyLabel(keyLabel);
        if (!masterSeedData
            || !masterSeedData.key_store_type) {
            throw new ValidationError('Invalid key label');
        }

        const keyStoreType = masterSeedData.key_store_type;

        const { masterSeed } = await serviceMapping.KEY_SERVICES[keyStoreType].getMasterSeed(keyLabel);

        const masterSeedUtf8Array = Buffer.from(masterSeed, 'hex');
        const hdkey = HDKey.fromMasterSeed(masterSeedUtf8Array);
        const childKey = hdkey.derive(derivationPath);

        let normalisedData;

        if (!data || data.length === 0){
            normalisedData = '0x';
        } else { 
            normalisedData = data;
        }
        
        const rlpTx = {
            nonce:      hexUtils.integerToHexString(nonce),
            gasPrice:   hexUtils.integerToHexString(gasPrice),
            gas:        hexUtils.integerToHexString(gas),
            to:         to,
            value:      hexUtils.integerToHexString(value),
            data:       normalisedData,
            v:          hexUtils.integerToHexString(chainData.public_chain_identifier),
            r:          hexUtils.integerToHexString(0),
            s:          hexUtils.integerToHexString(0),
        }

        const unsignedTxElements = Object.values(rlpTx);
        const hexConvertedUnsignedTxElements = unsignedTxElements.map(value =>  {
            const hexValue = Buffer.from(hexUtils.hexStringToByteArray(value));
            return hexValue
        });

        const serializedUnsignedTransaction = rlp.encode(hexConvertedUnsignedTxElements);
        const unsignedTxHash = keccak(serializedUnsignedTransaction);
        
        const ephermeral = await serviceMapping.KEY_SERVICES[keyStoreType].generateNonce();
        const ephermeralUint8Array = hexUtils.hexStringToByteArray(ephermeral)

        const { r, s, v } = regularSignHash(
            childKey.privateKey, 
            unsignedTxHash, 
            chainData.public_chain_identifier,
            { noncefn : () => ephermeralUint8Array }
        );

        const signedTransaction = {
            ... rlpTx,
            v,
            r,
            s,
        }

        const txElements = Object.values(signedTransaction);
        const hexConvertedTxElements = txElements.map(value =>  {
            const hexValue = Buffer.from(hexUtils.hexStringToByteArray(value));
            return hexValue
        });

        const serializedTransaction = rlp.encode(hexConvertedTxElements);
        const signedTxHash = keccak(serializedTransaction);

        return { transaction: signedTransaction, 
            txForBroadcast: hexUtils.byteToHexString(rlp.encode(hexConvertedTxElements), true),
            signedTxHash: hexUtils.byteToHexString(signedTxHash, true)
        };

    } catch (error) {
        if (error instanceof CustodyError){
            throw error;
        }
        throw new ProcessingError('Error signing data: ' + error.message);
    }
}

/**
 * 
 * @param {*} keyLabel 
 * @param {*} chainName 
 * @param {*} derivationPath 
 * @param {*} hash 
 * @param {*} isGnosis 
 * @returns {{r: String, s: String, v: String, rawSignature: String, signedHash: String, address: String}}
 */
async function signHash(keyLabel, chainName, derivationPath, hash, isGnosis = false) {
    try {
        let chainData = null;

        // get chain from db if present
        if (chainName) {
            chainData = await chainConfig.getChainByName(chainName);
        }

        if (chainData?.public_chain_identifier && !Number.isInteger(chainData.public_chain_identifier)){
            chainData.public_chain_identifier = Number(chainData.public_chain_identifier)
        }

        // Get the master seed
        const masterSeedData = await masterSeedInterface.getKeyStoreTypeFromKeyLabel(keyLabel);

        if (!masterSeedData
            || !masterSeedData.key_store_type) {
            throw new ValidationError('Invalid key label');
        }

        const keyStoreType = masterSeedData.key_store_type;

        const { masterSeed } = await serviceMapping.KEY_SERVICES[keyStoreType].getMasterSeed(keyLabel);

        const masterSeedUtf8Array = Buffer.from(masterSeed, 'hex');
        const hdkey = HDKey.fromMasterSeed(masterSeedUtf8Array);
        const childKey = hdkey.derive(derivationPath);

        const ephermeral = await serviceMapping.KEY_SERVICES[keyStoreType].generateNonce();
        const ephermeralUint8Array = hexUtils.hexStringToByteArray(ephermeral)

        const signFn = isGnosis ? gnosisSignHash : regularSignHash;
        const { r, s, v, rawSignature: rawSignatureUtfArr } = signFn(
            childKey.privateKey, 
            hash, 
            chainData?.public_chain_identifier?? false,
            { noncefn : () => ephermeralUint8Array }
        );

        const { address } = publicKeyToEthAddress(childKey.publicKey);

        return { r, s, v, signedHash: hash, rawSignature: hexUtils.byteToHexString(rawSignatureUtfArr, true), address }

    } catch (error) {
        if (error instanceof CustodyError){
            throw error;
        }
        throw new ProcessingError('Error signing data: ' + error.message);
    }
}

module.exports = {
    signTransaction,
    signHash,
}