const { HDKey } = require('@scure/bip32');

const serviceMapping = require('../service-mapping');
const masterSeedInterface = require('../../../lib/db/tables/master-seed');
const chainConfig = require('../../../lib/db/tables/chain-config')
const { signHash: regularSignHash, publicKeyToEthAddress } = require('../../../lib/crypto/secp256k1')
const hexUtils = require('../../../lib/hex');
const ValidationError = require('../../../lib/errors/validation-error');
const CustodyError = require('../../../lib/errors/custody-error');
const ProcessingError = require('../../../lib/errors/processing-error');
const Logger = require('../../../lib/logger/config');

/**
 * 
 * @param {*} keyLabel 
 * @param {*} chainName 
 * @param {*} derivationPath 
 * @param {*} hash 
 * @param {*} isGnosis 
 * @returns {{r: String, s: String, v: String, rawSignature: String, signedHash: String, address: String}}
 */
async function signHash(keyLabel, chainName, derivationPath, hash) {
    try {
        let chainData = null;

        // get chain from db if present
        if (chainName) {
            chainData = await chainConfig.getChainByName(chainName);
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

        const { r, s, v, rawSignature: rawSignatureUtfArr } = regularSignHash(
            childKey.privateKey, 
            hash, 
            false,
            { noncefn: () => ephermeralUint8Array }
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
    signHash
}