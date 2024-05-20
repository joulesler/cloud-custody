const AWS = require('aws-sdk');
const UUID = require('uuid');

// Singleton instance of AWS KMS client
let kmsInstance;

const awsKmsKeyTypes = {
  ECC_SECG_P256K1: 'ECC_SECG_P256K1',
  SYMMETRIC_DEFAULT: 'SYMMETRIC_DEFAULT',
};

/**
 * Function to get a singleton instance of the AWS KMS client
 * @returns {AWS.KMS}
 */
function kmsClient() {
  // Check if the instance already exists
  if (!kmsInstance) {
    // Set the AWS region
    AWS.config.update({ region: 'ap-southeast-1' }); // Change the region as needed
    // Create a new KMS instance
    kmsInstance = new AWS.KMS();
  }
  return kmsInstance;
}

function getTags(keyName) {
  if (keyName) {
    return [{ TagKey: 'keyName', TagValue: keyName }];
  }
  return undefined;
}

/**
 * Function to generate a non-extractable data key
 * @param {AWS.KMS.DataKeySpec} types
 * @returns
 */
async function generateNonExtractableDataKey(type) {
  // Get the KMS client
  const kms = kmsClient();

  // Define the key parameters
  try {
    const params = {
      KeyId: 'your-key-id', // Replace with your KMS key ID
      KeySpec: type || 'AES_256', // You can specify the desired key spec here
      Origin: 'AWS_KMS',
      KeyUsage: 'ENCRYPT_DECRYPT', // Adjust according to your use case
      EncryptionContext: { KeyName: 'example' }, // Optionally provide encryption context
      BypassPolicyLockoutSafetyCheck: true,
      Description: 'Non-extractable symmetric key',
    };

    const { Plaintext, CiphertextBlob } = await kms.generateDataKey(params).promise();

    return { plaintextKey: Plaintext, encryptedKey: CiphertextBlob };
  } catch (err) {
    console.error('Error generating data key:', err);
    throw err;
  }
}

/**
 * Function to create an encryption key
 * @param {*} keyName
 * @returns {AWS.KMS.KeyMetadata}
 */
async function createEncryptionKey(keyName) {
  const kms = kmsClient();
  try {
    const params = {
      CustomerMasterKeySpec: 'SYMMETRIC_DEFAULT', // 'RSA_2048' or 'ECC_NIST_P256' or 'ECC_NIST_P384' or 'ECC_NIST_P521' or 'ECC_SECG_P256K1' or 'ECC_SECG_P384R1' or 'ECC_SECG_P521R1' or 'ECC_SECG_P256K1' or 'SYMMETRIC_DEFAULT'
      Origin: 'AWS_KMS',
      Description: 'Asymmetric encryption key',
      Tags: getTags(`${keyName}-KEK`),
    };

    const { KeyMetadata } = await kms.createKey(params).promise();

    return KeyMetadata;
  } catch (err) {
    console.error('Error creating asymmetric encryption key:', err);
    throw err;
  }
}

async function generateStandalonePrivateKey(keyName, type) {
  const kms = kmsClient();
  let keyId = keyName || UUID.v4();
  keyId += 'standalone';
  try {
    const params = {
      CustomerMasterKeySpec: type || 'ECC_SECG_P256K1', // 'RSA_2048' or 'ECC_NIST_P256' or 'ECC_NIST_P384' or 'ECC_NIST_P521' or 'ECC_SECG_P256K1' or 'ECC_SECG_P384R1' or 'ECC_SECG_P521R1' or 'ECC_SECG_P256K1' or 'SYMMETRIC_DEFAULT'
      KeyUsage: 'SIGN_VERIFY', // 'SIGN_VERIFY' or 'ENCRYPT_DECRYPT'
      Origin: 'AWS_KMS',
      Description: 'Standalone private key',
      Tags: getTags(`${keyId}`),
    };

    const { KeyMaterial } = await kms.createKey(params).promise();

    return KeyMaterial.toString('hex');
  } catch (err) {
    console.error('Error generating private key:', err);
    throw err;
  }
}

/**
 *
 * @param {AWS.KMS.GenerateRandomRequest} numberOfBytes
 * @returns {string} hex encoded string from AWS {Plaintext}, a base 64 encoded string
 */
async function generateRandomSeed(numberOfBytes = 64) {
  const kms = kmsClient();
  try {
    const params = {
      NumberOfBytes: numberOfBytes, // 512 bits (64 bytes)
    };

    const { Plaintext } = await kms.generateRandom(params).promise();
    return Plaintext.toString('hex');
  } catch (err) {
    console.error('Error generating random seed:', err);
    throw err;
  }
}

/**
 *
 * @param {AWS.KMS.EncryptRequest} dataToEncrypt: Plaintext
 * @param {AWS.KMS.EncryptRequest} encryptionKeyId: KeyId
 * @returns {AWS.KMS.EncryptResponse} CiphertextBlob
 */
async function encryptData(dataToEncrypt, encryptionKeyId) {
  const kms = kmsClient();
  try {
    const encryptedData = await kms.encrypt({
      Plaintext: dataToEncrypt,
      KeyId: encryptionKeyId,
    }).promise();
    return encryptedData.CiphertextBlob;
  } catch (err) {
    console.error('Error encrypting data:', err);
    throw err;
  }
}

/**
 * 
 * @param {*} dataToDecrypt 
 * @param {*} encryptionKeyId 
 * @returns 
 */
async function decryptData(dataToDecrypt, encryptionKeyId) {
  const kms = kmsClient();
  try {
    const decryptedData = await kms.decrypt({
      KeyId: encryptionKeyId,
      CiphertextBlob: dataToDecrypt,
    }).promise();
    return decryptedData.Plaintext;
  } catch (err) {
    console.error('Error decrypting data:', err);
    throw err;
  }
}

module.exports = {
  awsKmsKeyTypes,
  kmsClient,
  createEncryptionKey,
  generateNonExtractableDataKey,
  generateStandalonePrivateKey,
  generateRandomSeed,
  encryptData,
  decryptData,
};
