const assert = require('bsert');

const TXUX = require('./uxtx.js');

class TxnManager {
  constructor(options) {
    // hash -> parsed transaction
    this._parsed = {};

    if (options)
      this.fromOptions(options);
  }

  static fromOptions(options) {
    return new this().fromOptions(options);
  }

  fromOptions(options) {
    if (options.custom) {
      assert(typeof options.custom === 'function');
      this.custom = options.custom;
    }

    if (options.constants) {
      // TODO: validation
      this.constants = options.constants;
    }

    if (options.dateFormat) {
      this.dateFormat = dateFormat;
    }

    return this;
  }

  /**
   * Clear any cached values.
   */
  // TODO: _ prefix
  refresh() {
    this._parsed = {};
  }

  // bust - bool
  // update api to allow for list of txns to bust
  parse(transactions, wallet = null, bust = false) {
    // use custom parsing function
    if (this.custom)
      return this.custom(transactions, wallet, bust);

    const { constants } = this;

    return transactions.map(txn => {
      // no global bust and the transaction already parsed
      if (bust === false && txn.hash in this._parsed)
        return this._parsed[txn.hash];

      const options = {
        dateFormat: constants.dateFormat,
        copy: constants,
        json: txn,
      };
      const txux = TXUX.fromRaw(txn.tx, 'hex', options);

      // cache output
      const json = txux.toJSON();
      this._parsed[txn.hash] = json;

      return json;
    });
  }
}

// initial values
const copy = {
  SEND: 'Sent',
  RECEIVE: 'Received',
  COINBASE_RECEIVE: 'Coinbase',
  MULTIPLE_OUTPUT_COPY: 'Multiple',
  UNKNOWN_ADDRESS_COPY: 'Unknown',
};

module.exports = {
  TxnManager,
  TxnManagerOptions: {
    copy,
    custom: null,
    constants: {
      dateFormat: 'MM/DD/YY hh:mm a',
    }
  }
}
