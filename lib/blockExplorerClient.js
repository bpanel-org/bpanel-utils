const { networks } = require('bcoin');
const assert = require('bsert');
const url = require('url');

const PROTOCOLS = ['bitcoin', 'bitcoincash'];

const BLOCK_EXPLORERS = {
  bitcoin: {
    main: {
      'btc.com': 'https://btc.com', // /{txhash}
      blocktrail: 'https://www.blocktrail.com/BTC',
    },
    testnet: {
      blocktrail: 'https://www.blocktrail.com/tBTC', // /tx/{txhash}
    }
  },
  bitcoincash: {
    main: {
      'btc.com': 'https://bch.btc.com',
      blocktrail: 'https://www.blocktrail.com/BCC',
    },
    testnet: {
      blocktrail: 'https://www.blocktrail.com/tBCC',
    },
  },
};

const EXPLORER_SUFFIXES = {
  blocktrail: {
    transaction: '/tx/',
  },
  'btc.com': {
    transaction: '/',
  },
};

// networks: main,testnet
// chain: bitcoin,bitcoincash
class BlockExplorerClient {
  constructor(options) {
    this._explorers = BLOCK_EXPLORERS;
    this._protocols = PROTOCOLS;
    this._suffixes = EXPLORER_SUFFIXES;
    this._networks = networks.types;
    this._protocol = null;
    this._chain = null;

    if (options)
      this.fromOptions(options);
  }

  static fromOptions(options) {
    return new this().fromOptions(options);
  }

  fromOptions(options) {
    assert(typeof options === 'object', 'options must be an object');
    assert(options.protocol, 'must pass a protocol');
    assert(options.chain, 'must past a chain network, ie main or testnet');

    assert(this._protocols.includes(options.protocol), `${options.protocol} must be a valid protocol: ${this._protocols}`)
    this._protocol = options.protocol;

    assert(this._networks.includes(options.chain), `${options.chain} must be a valid chain: ${this._networks}`);
    this._chain = options.chain;

    return this;
  }

  getExplorers() {
    return this._explorers[this._protocol][this._chain];
  }

  getSuffixes() {
    return this._suffixes;
  }

  toLink(name, url, type) {
    const suffixes = this.getSuffixes();
    return `${url}${suffixes[name][type]}`;
  }

  getTransactionLinks(txhash) {
    const explorers = this.getExplorers();
    const links = [];
    for (let [key, val] of Object.entries(explorers)) {
      const link = this.toLink(key, val, 'transaction');
      const u = url.parse(`${link}${txhash}`);
      links.push(u);
    }
    return links;
  }
}

module.exports = {
  BlockExplorerClient,
  PROTOCOLS,
  BLOCK_EXPLORERS,
  EXPLORER_SUFFIXES,
}
