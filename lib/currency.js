const { Amount, pkg: hsdPkg } = require('hsd');
const assert = require('bsert');

const { isChainSupported } = require('./chain');

export const CURRENCY_UNITS = {
  bitcoin: {
    currency: 'bitcoin',
    unit: 'btc',
    milli: 'mbtc',
    micro: 'bit',
    base: 'satoshi',
  },
  handshake: {
    currency: hsdPkg.currency,
    unit: hsdPkg.unit,
    milli: `m${hsdPkg.unit}`,
    micro: `u${hsdPkg.unit}`,
    base: hsdPkg.base,
  },
};

export const CURRENCY_TYPES = {
  currency: 'currency',
  unit: 'unit',
  milli: 'milli',
  micro: 'micro',
  base: 'base',
};
// bitcoincash units currently same as bitcoin
CURRENCY_UNITS.bitcoincash = { ...CURRENCY_UNITS.bitcoin };

class Currency extends Amount {
  /**
   * Create an object for getting currency units and amounts
   * @constructor
   * @param {string} chain - one of supported chain types
   * see { chain.CHAINS }
   * @param {(String|Number)?} value
   * @param {String?} unit
   * @returns {Currency}
   */
  constructor(chain, value, unit) {
    super(value, unit);
    const options = new CurrencyOptions(chain);
    this.chain = options.chain;
    this.units = options.units;
  }

  /*
   * Get actual unit string
   * @param {string} unit - one of supported unit types
   * returns {string}
   */
  getUnit(unit) {
    assert(CURRENCY_TYPES[unit], `${unit} not a supported unit type`);
    return this.units[unit];
  }

  /**
   * Get unit string or value.
   * Overwrites hsd's Amount for more generalized API
   * @param {String} unit
   * @param {Boolean?} num
   * @returns {String|Amount}
   */

  to(unit, num) {
    const types = CURRENCY_TYPES;
    switch (unit) {
      case types.base:
        return this.toBase(num);
      case types.micro:
      case 'bits':
        return this.toBits(num);
      case types.milli:
        // hsd's `toMilli` has a bug
        // this is a temporary fix
        return Amount.encode(this.value, 5, num);
      case types.currency:
      case types.unit:
        return this.toCoins(num);
    }
    throw new Error(`Unknown unit "${unit}".`);
  }

  /**
   * Inject properties from unit.
   * @private
   * @param {String} unit
   * @param {Number|String} value
   * @returns {Amount}
   */

  from(unit, value) {
    const types = CURRENCY_TYPES;
    switch (unit) {
      case types.base:
        return this.fromBase(value);
      case types.micro:
      case 'bits':
        return this.fromBits(value);
      case types.milli:
        return this.fromMilli(value);
      case types.currency:
      case types.unit:
        return this.fromCoins(value);
    }
    throw new Error(`Unknown unit "${unit}".`);
  }

  /**
   * Instantiate amount from unit.
   * @param {String} unit
   * @param {Number|String} value
   * @returns {Amount}
   */

  static from(chain, unit, value) {
    return new this(chain).from(unit, value);
  }
}

class CurrencyOptions {
  constructor(chain) {
    assert(chain, 'must pass a chain to create Currency object');
    assert(isChainSupported(chain), `${chain} is not a supported chain`);
    this.chain = chain;
    this.units = CURRENCY_UNITS[this.chain];
    return this;
  }
}

export default Currency;
