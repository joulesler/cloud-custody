
/**
 * 
 * @param {String} input 
 * @returns 
 */
exports.removeHexPrefix = (input) =>  {
    if (typeof input === 'string') {
      if (input.startsWith('0x')) {
        return input.slice(2);
      }
    }
    return input;
}


/**
 * 
 * @param {Array} byteArray 
 * @param {Boolean} prefix 
 * @returns 
 */
exports.byteToHexString = (byteArray, prefix) =>  {
    const hexString =  Array.from(byteArray, byte => byte.toString(16).padStart(2, '0')).join('');
    if (prefix) {
        return '0x' + hexString;
    }
    return hexString;
}

/**
 * 
 * @param {Number} integer 
 * @param {Boolean} prefix 
 * @returns 
 */
exports.integerToHexString = (integer, prefix) => {
  if (integer < 0) {
      throw new Error('Invalid input. Integer must be greater than or equal to 0');
  }
  if (typeof integer !== 'number') {
      throw new Error('Invalid input. Must be a number');
  }
  if (integer === 0) {
      return prefix ? '0x' : '';
  }
  let hexString = integer.toString(16);
  // ensure the string is even length
  hexString = hexString.length % 2 ? '0' + hexString : hexString;
  if (prefix) {
      return '0x' + hexString;
  }
  return hexString;
}

/**
 * 
 * @param {String} hexString 
 * @returns {Uint8Array}
 */
exports.hexStringToByteArray = (hexString) => {
  hexString = hexString.replace(/^0x/, '');
  if (hexString.length == 0){
    return new Uint8Array();
  }
  return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}