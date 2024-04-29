const secp256k1 = require('secp256k1');
const ethUtil = require('ethereumjs-util');

function isValidSecp256k1PrivateKey(privateKey) {
  return secp256k1.privateKeyVerify(Buffer.from(privateKey, 'hex'));
}

function publicKeyToEthAddress(publicKey) {
  console.log('publicKey:', publicKey);

  // Remove the '04' prefix from the public key if it exists
  const pubKeyWithoutPrefix = publicKey.startsWith('04') ? publicKey.slice(2) : publicKey;

  // Convert the public key to a Buffer
  const pubKeyBuffer = Buffer.from(pubKeyWithoutPrefix, 'hex');

  // Hash the public key
  const hash = ethUtil.keccak256(pubKeyBuffer);

  // Take the last 20 bytes of the hash and convert it to an Ethereum address
  const address = ethUtil.bufferToHex(hash.slice(-20));

  // Ensure the address starts with '0x'
  const ethAddress = address.startsWith('0x') ? address : `0x${address}`;

  return ethAddress;
}

module.exports = {
  isValidSecp256k1PrivateKey,
  publicKeyToEthAddress,
};
