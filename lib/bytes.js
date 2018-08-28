/**
 * Check if number is U8 integer
 * @param {Number} value
 * @returns {Boolean}
 */
function isU8(value) {
  return (value & 0xff) === value;
};

/**
 * Check if number is U16 integer
 * @param {Number} websafe
 * @returns {Boolean}
 */
function isU16(value) {
  return (value & 0xffff) === value;
};

export default {
  isU8,
  isU16,
};
