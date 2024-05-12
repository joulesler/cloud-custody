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
 * @param {boolean} prefix 
 * @returns 
 */
exports.byteToHexString = (byteArray, prefix) =>  {
    const hexString =  byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    if (prefix) {
        return '0x' + hexString;
    }
    return hexString;
}

exports.integerToHexString = (integer, prefix) => {
  let hexString = integer.toString(16);
  if (prefix) {
      return '0x' + hexString;
  }
  return hexString;
}