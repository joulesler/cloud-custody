const { SUPPORTED_KMS } = require('../../lib/enums/keys');

module.exports = {
  '/generate-master/:kmsType': {
    post: {
      description: 'Generate a master key pair for a chain',
      body: {
        chainId: {
          type: 'string',
          required: true,
          description: 'The chain id for which the master key pair is to be generated',
        },
        isMasterKey: {
          type: 'boolean',
          required: true,
          description: 'The type of the key to be generated',
        },
        kmsType: {
          type: 'string',
          required: true,
          description: 'The type of the kms to be used',
          enum: SUPPORTED_KMS,
        },
      },
    },
  },
};
