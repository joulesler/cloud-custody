const UUID = require('uuid');
const { HDKey } = require('@scure/bip32');
const kms = require('../../../lib/aws/kms/kms');
const { db } = require('../../../lib/db/db');
const { KEY_REFERENCE_TYPE } = require('../../../lib/enums/keys');

const masterTable = require('../../../lib/db/tables/master-seed');
const childTable = require('../../../lib/db/tables/child-keys');
const chainConfig = require('../../../lib/db/tables/chain-config');

const { publicKeyToEthAddress } = require('../../../lib/crypto/secp256k1');

const { SUPPORTED_KMS } = require('../../../lib/enums/keys');

/**
 *
 * @param {*} isMasterKey
 * @param {*} chainId
 * <p>1. Use KMS to generate a master seed via the RNG api</p>
 * <p>2. Generate an encryption key for the private key (KEK)</p>
 * <p>3. Encrypt the private key with the KEK</p>
 * <p>4. Store the encrypted private key in the database</p>
 * <p>5. Store the KEK in the KMS</p>
 *
 * @returns {Promise<{x_pub_key: string, chain_code: string, KeyId: string, Arn: string}>}
 */
async function generateKey(isMasterKey, chainId) {
  const keyName = UUID.v4();
  try {
    if (!chainId) {
      throw new Error('Chain id is required');
    }

    const chain = await chainConfig.getChainByPubId(chainId);
    if (!chain || !chain.seed_length || !chain.seed_length > 0) {
      throw new Error('Chain seed config not found');
    }

    // 1. Generate the master seed
    const masterSeed = await kms.generateRandomSeed(chain.seed_length);

    // 2. Generate the encryption key
    const {
      KeyId, Arn, KeySpec,
    } = await kms.createEncryptionKey(keyName);

    // 3. Encrypt the master seed
    const masterSeedBuffer = Buffer.from(masterSeed, 'hex');

    const encryptedSeed = await kms.encryptData(masterSeedBuffer, KeyId);
    const encryptedSeedHex = encryptedSeed.toString('hex');

    // Get the extended public key from the master seed
    const masterSeedUtf8Array = Buffer.from(masterSeed, 'hex');
    const hdkey = HDKey.fromMasterSeed(masterSeedUtf8Array);
    const x_pub_key = hdkey.publicExtendedKey;
    const chain_code = hdkey.chainCode;

    const chainCodeHex = Array.from(chain_code).map((byte) => byte.toString(16).padStart(2, '0')).join('');

    // Clear the buffers for security
    masterSeedBuffer.fill(0);
    masterSeedUtf8Array.fill(0);

    // 4. Store the encrypted seed in the database
    const masterKeyDb = new masterTable.masterSeed({
      key_store_type: SUPPORTED_KMS.AWS_KMS,
      encrypted_seed: encryptedSeedHex,
      encrypting_key_label: KeyId,
      encrypting_key_algo: KeySpec,
      x_pub_key,
      chain_code: chainCodeHex,
      key_type: isMasterKey ? KEY_REFERENCE_TYPE.SEED : KEY_REFERENCE_TYPE.KEY_LABEL,
    });

    await db(masterTable.TABLE_NAME).insert(masterKeyDb);
    return {
      xPubKey: x_pub_key, chainCode: chainCodeHex, KeyId, Arn,
    };
  } catch (error) {
    console.error('Error generating master key:', error);
    throw error;
  }
}

/**
 *
 * @param {*} derivationPath eg. m/44'/60'/0'/0/0
 * @param {*} masterKeyLabel e.g. 6eafda87-3e7c-49b2-b3e4-38f9e9aadfff
 * @param {*} xPubKey e.g. xpub661MyMwAqRbcGiD1SpeM5JygNck8sipZjD3qKra1Koa3LUZobseNAiFSiYKd4yfzpv3voGAMPZ5qRKbDii2LPMMdq95YemF1sRgYqTkGNL5
 *
 */
async function deriveChildKey(derivationPath, { masterKeyLabel, xPubKey }) {
  if (masterKeyLabel && xPubKey) {
    throw new Error('Only one of masterKeyLabel or xPubKey should be provided');
  }

  const { masterSeed, masterSeedDb } = await getMasterSeed(masterKeyLabel, xPubKey);
  // Check the derivation path and masterKeyId does not already exist
  const existingChildKey = await db(childTable.TABLE_NAME).where({ derivation_path: derivationPath, master_seed_id: masterSeedDb.id }).first();

  if (existingChildKey) {
    throw new Error('Child key already exists');
  }

  // 3. Derive the child key
  const masterSeedUtf8Array = Buffer.from(masterSeed, 'hex');
  const hdkey = HDKey.fromMasterSeed(masterSeedUtf8Array);
  const childKey = hdkey.derive(derivationPath);

  // TODO check that derivation is correct from the data to the mapping
  console.log('childKey:', childKey)
  console.log('childKey.publicKey:', childKey.publicKey)
  const publicKey = Array.from(childKey.publicKey).map((byte) => byte.toString(16).padStart(2, '0')).join('');

  console.log('publicKey:', publicKey);
  const address = publicKeyToEthAddress(publicKey);
  // 4. Save key to child key db
  const childKeyDb = await db(childTable.TABLE_NAME).insert(new childTable.ChildKeys({
    is_child: true,
    derivation_path: derivationPath,
    master_seed_id: masterSeedDb.id,
    public_key: publicKey,
    address,
  }));

  if (!childKeyDb) {
    throw new Error('Error saving child key to database');
  }

  return { publicKey, address };
}

async function getMasterSeed(masterKeyLabel, xPubKey) {
    try {
        let masterSeedDb;
        if (masterKeyLabel) {
          masterSeedDb = await db(masterTable.TABLE_NAME).where({ encrypting_key_label: masterKeyLabel }).first();
        } else {
          masterSeedDb = await db(masterTable.TABLE_NAME).where({ x_pub_key: xPubKey }).first();
        }
      
        if (!masterSeedDb) {
          throw new Error('Master key not found');
        }
      
        // 2. Decrypt master seed
        const encryptedSeed = Buffer.from(masterSeedDb.encrypted_seed, 'hex');
        const decryptedSeed = await kms.decryptData(encryptedSeed, masterSeedDb.encrypting_key_label);
        const masterSeed = decryptedSeed.toString('hex');
        
        return { masterSeed, masterSeedDb };
    } catch (err) {
      console.error('Error signing data:', err);
      throw err;
    }
  }

module.exports = {
  generateKey,
  deriveChildKey,
  getMasterSeed,
};
