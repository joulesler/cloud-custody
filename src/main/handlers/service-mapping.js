const { SUPPORTED_KMS } = require('../../lib/enums/keys');

const KEY_SERVICES = {
  [SUPPORTED_KMS.AWS_KMS]: require('./aws-kms/aws-kms'),
  // [SUPPORTED_KMS.LOCAL_KMS]: require('./local-kms'),
  // [SUPPORTED_KMS.AWS_CLOUDHSM_KMS]: require('./aws-cloudhsm-kms'),
};

module.exports = {
    KEY_SERVICES,
};