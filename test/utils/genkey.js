const crypto = require('crypto');

// Generate an RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048, // Key size in bits
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
    },
});

// Function to format key with explicit \n characters
function formatKey(key) {
    return key.replace(/\n/g, '\\n');
}

// Output the formatted keys
console.log('Public Key:', formatKey(publicKey));
console.log('Private Key:', formatKey(privateKey));