// take in gnosis fields and create data back
const Web3 = require('web3');
const hexUtils = require('../../lib/hex');
const logger = require('../../lib/logger/config');

const ValidationError = require('../../lib/errors/validation-error');
const safe = require('../handlers/gnosis-safe/safe');
const getTransactionHashAbi = require('../../../abi/gnosis/get-transaction-hash.json');

const web3 = new Web3.Web3();

async function gnosisTransaction({
  to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signatures,
}) {
  try {
    if (!to) {
      throw new ValidationError('to address is required');
    }
    if (!value) {
      throw new ValidationError('value is required');
    }
    // enum make sure its of the two values, DelegateCall or Call
    if ((typeof operation !== 'number' && !operation) || (operation !== safe.Operations.Call && operation !== safe.Operations.DelegateCall)) {
      throw new ValidationError('operation must be either DelegateCall or Call');
    }
    if (!gasPrice && gasPrice !== 0) {
      throw new ValidationError('gasPrice is required');
    }

    const abiEncodeDdata = await safe.encodeExecTransaction(to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signatures);

    return { success: true, encodedData: abiEncodeDdata };
  } catch (error) {
    // Send the error response
    logger.error(error);
    return { success: false, error: error.message };
  }
}

async function gnosisAddSignature({ ethSafeTransaction, ethSignSignature }) {
  try {
    if (!ethSafeTransaction) {
      throw new ValidationError('ethSafeTransaction is required');
    }
    if (!ethSignSignature) {
      throw new ValidationError('ethSignSignature is required');
    }

    const safeTransaction = await safe.addSignatureToSafeTransaction(ethSafeTransaction, ethSignSignature);

    return { success: true, safeTransaction };
  } catch (error) {
    // Send the error response
    logger.error(error);
    return { success: false, error: error.message };
  }
}

async function gnosisApproveHash({ safeTxHash, masterKeyLabel, derivationPath }) {
  try {
    if (!safeTxHash) {
      throw new ValidationError('safeTxHash is required');
    }

    const safeSignature = await safe.approveHash(safeTxHash, masterKeyLabel, derivationPath);
    return { success: true, ...safeSignature };
  } catch (error) {
    // Send the error response
    logger.error(error);
    return { success: false, error: error.message };
  }
}

async function gnosisGetTransactionHash({
  to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, nonce,
}) {
  let abiData;
  try {
    const safeTxGasBN = hexUtils.numericalToBigInt(safeTxGas);
    const baseGasBN = hexUtils.numericalToBigInt(baseGas);
    const gasPriceBN = hexUtils.numericalToBigInt(gasPrice);
    const valueBN = hexUtils.numericalToBigInt(value);
    const nonceBN = hexUtils.numericalToBigInt(nonce);

    abiData = web3.eth.abi.encodeFunctionCall(getTransactionHashAbi, [to, valueBN, data, operation, safeTxGasBN, baseGasBN, gasPriceBN, gasToken, refundReceiver, nonceBN]);
  } catch (e) {
    logger.error(e.message);
    return { success: false, error: e.message };
  }
  return abiData;
}

/**
 * Function to generate gnosis safe transaction data
 * @param {*} app
 */
function gnosisData(app) {
  app.post('/gnosis/execTransaction', async (req, res) => {
    try {
      const {
        to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signatures,
      } = req.body;

      if (!to) {
        throw new ValidationError('to address is required');
      }
      if (!value) {
        throw new ValidationError('value is required');
      }
      // enum make sure its of the two values, DelegateCall or Call
      if ((typeof operation !== 'number' && !operation) || (operation !== safe.Operations.Call && operation !== safe.Operations.DelegateCall)) {
        throw new ValidationError('operation must be either DelegateCall or Call');
      }
      if (!gasPrice && gasPrice !== 0) {
        throw new ValidationError('gasPrice is required');
      }

      const abiEncodeDdata = await safe.encodeExecTransaction(to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, signatures);

      res.json({ success: true, encodedData: abiEncodeDdata });
    } catch (error) {
      // Send the error response
      logger.error(error);
      res.json({ success: false, error: error.message });
    }
  });
}

/**
 * @param {Object} req.body - The body of the request.
 * @param {EthSafeTransaction} req.body.ethSafeTransaction - The EthSafeTransaction object.
 * @param {SafeProtocol.EthSafeSignature} req.body.ethSignSignature - The EthSafeSignature object from SafeProtocol.
 */
function addSignature(app) {
  app.post('/gnosis/addSignature', async (req, res) => {
    try {
      const { ethSafeTransaction, ethSignSignature } = req.body;

      if (!ethSafeTransaction) {
        throw new ValidationError('ethSafeTransaction is required');
      }
      if (!ethSignSignature) {
        throw new ValidationError('ethSignSignature is required');
      }

      const safeTransaction = await safe.addSignatureToSafeTransaction(ethSafeTransaction, ethSignSignature);

      res.json({ success: true, safeTransaction });
    } catch (error) {
      // Send the error response
      logger.error(error);
      res.json({ success: false, error: error.message });
    }
  });
}

function approveHash(app) {
  app.post('/gnosis/approveHash', async (req, res) => {
    try {
      const { safeTxHash, masterKeyLabel, derivationPath } = req.body;

      if (!safeTxHash) {
        throw new ValidationError('safeTxHash is required');
      }

      const safeSignature = await safe.approveHash(safeTxHash, masterKeyLabel, derivationPath);
      res.json({ success: true, ...safeSignature });
    } catch (error) {
      // Send the error response
      logger.error(error);
      let statusCode = 500;
      if (error.status) {
        statusCode = error.status;
      }
      res.status(statusCode).json({ success: false, error: error.message });
    }
  });
}

function getTransactionHash(app) {
  app.get('/gnosis/getHashAbi', (req, res) => {
    const {
      to, value, data, operation, safeTxGas, baseGas, gasPrice, gasToken, refundReceiver, nonce,
    } = req.body;
    let abiData;
    try {
      const safeTxGasBN = hexUtils.numericalToBigInt(safeTxGas);
      const baseGasBN = hexUtils.numericalToBigInt(baseGas);
      const gasPriceBN = hexUtils.numericalToBigInt(gasPrice);
      const valueBN = hexUtils.numericalToBigInt(value);
      const nonceBN = hexUtils.numericalToBigInt(nonce);

      abiData = web3.eth.abi.encodeFunctionCall(getTransactionHashAbi, [to, valueBN, data, operation, safeTxGasBN, baseGasBN, gasPriceBN, gasToken, refundReceiver, nonceBN]);
    } catch (e) {
      logger.error(e.message);
    }

    res.send(abiData);
  });
}

module.exports = {
  gnosisData,
  addSignature,
  approveHash,
  getTransactionHash,
  gnosisTransaction,
  gnosisAddSignature,
  gnosisApproveHash,
  gnosisGetTransactionHash,
};
