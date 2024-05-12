const secp256k1 = require('secp256k1');
const ethUtil = require('ethereumjs-util');
const hexUtils = require('../hex');

function isValidSecp256k1PrivateKey(privateKey) {
  return secp256k1.privateKeyVerify(Buffer.from(privateKey, 'hex'));
}

/**
 * @param {string} publicKey a byte array encoded public key
 */
function publicKeyToEthAddress(publicKey) {
  console.log('publicKey:', publicKey);

  if (publicKey.length == 33){
    // this is the compressed public key
    // decompress it
    publicKey = secp256k1.publicKeyConvert(publicKey, false);
  }
  console.log('publicKey:', publicKey);

  // Remove the '04' prefix from the public key if it exists
  const pubKeyWithoutPrefix = publicKey[0] == 4 ? publicKey.slice(1) : publicKey;

  // Convert the public key to a Buffer
  const pubKeyBuffer = Buffer.from(pubKeyWithoutPrefix);

  // Hash the public key
  const hash = ethUtil.keccak256(pubKeyBuffer);

  // Take the last 20 bytes of the hash and convert it to an Ethereum address
  const address = ethUtil.bufferToHex(hash.slice(-20));

  // Ensure the address starts with '0x'
  const ethAddress = address.startsWith('0x') ? address : `0x${address}`;
  
  console.log('publicKey:', publicKey);
  // return the uncompressed public key and the Ethereum address
  return { uncompressedPublicKey: publicKey, address: ethAddress };
}


/**
 * @param {string} privateKey a hex encoded private key
 * @param {string} hash a hex encoded hash to sign (6 ELEMENTS only)
 * https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md#specification
 */
function signHash(privateKey, hash, chainId) {
  const privateKeyBuffer = Buffer.from(hexUtils.removeHexPrefix(privateKey), 'hex');
  const hashBuffer = Buffer.from(hexUtils.removeHexPrefix(hash), 'hex');
  const { signature, recid } = secp256k1.ecdsaSign(hashBuffer, privateKeyBuffer);
  const r = hexUtils.byteToHexString(signature.slice(0, 32), true);
  const s = hexUtils.byteToHexString(signature.slice(32), true);

  // Compute the parity value V
  const v = hexUtils.integerToHexString(chainId * 2 + 27 + (recid % 2), true);

  return { r, s, v };

}

module.exports = {
  isValidSecp256k1PrivateKey,
  publicKeyToEthAddress,
  signHash
};
