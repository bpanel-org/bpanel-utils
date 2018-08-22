/*!
 * clients.js - client extensions of bclient to connect to bpanel app server
 * Copyright (c) 2018, Bcoin Devs (MIT License).
 * https://github.com/bcoin-org/bpanel-utils
 */

'use strict';

import bclient from 'bclient';
import hsclient from 'hs-client';
import { Client } from 'bcurl';
import assert from 'bsert';
import MultisigClient from 'bmultisig/lib/client';

const { NodeClient: BNodeClient, WalletClient: BWalletClient } = bclient;
const { NodeClient: HNodeClient, WalletClient: HWalletClient } = hsclient;

class BPClient extends Client {
  /**
   * Create a client for use in bPanel.
   * @constructor
   * @param {Object} options
   */
  constructor(options) {
    super(options);

    const opts = new ClientOptions(options);

    // keep ref to pass to generated clients
    this.options = { ...options, ...opts };
    this.path = opts.path;
    this.id = opts.id;
    this.chain = opts.chain;
    this.node = opts.node;
    this.wallet = opts.wallet;
    this.multisig = opts.multisig;
    this.types = new Set(['node', 'wallet', 'multisig']);
    return this;
  }

  /*
   * Reset the class with new options
   * since the base options start as null
   * any options that are not explicitly reset
   * will be gone.
   * @returns {BpanelClient}
   */
  reset(options) {
    this.constructor(options);
    return this;
  }

  /*
   * Set a new id and chain if necessary
   * will update all clients as well
   * @param {string} id - id for client
   * @param {string} chain - One of 'bitcoin',
   * 'bitcoincash', or handshake
   * @returns {BPClient}
   */
  setId(id, chain) {
    assert(id && typeof id === 'string');
    this.id = id;
    if (chain) {
      assert(typeof chain === 'string');
      this.chain = chain;
    }

    this.setNodeClient();
    this.setWalletClient();
    this.setMultisigClient();

    return this;
  }

  /**
   * Get an object of all clients available on server
   * @returns {Promise}
   */
  getClients() {
    return this.get('/');
  }

  /**
   * Get info from bPanel server about client of this.id
   * @returns {Promise}
   */
  getClientInfo() {
    return this.get(`/${this.id}`);
  }

  /*
   * Get a client for sending requests to a node
   * Returns this.node and sets it if none is set
   * @returns {Client}
   */
  getNodeClient() {
    if (!this.node) this.setNodeClient();
    return this.node;
  }

  /*
   * Get a client for sending requests to a wallet node
   * Returns this.wallet and sets it if none is set
   * @returns {Client}
   */
  getWalletClient() {
    if (!this.wallet) this.setWalletClient();
    return this.wallet;
  }

  /*
   * Get a client for sending requests to a multisig node
   * Returns this.multisig and sets it if none is set
   * @returns {Client}
   */
  getMultisigClient() {
    if (!this.multisig) this.setMultisigClient();
    return this.multisig;
  }

  /*
   * Set the node client for the class
   * @param {string} _path - Can set a custom path
   * @returns {void}
   */
  setNodeClient(_path = null) {
    const path = this.getClientPath('node');

    if (this.chain === 'handshake')
      this.node = HNodeClient({ ...this.options, path });
    // defaults to returning bcoin client
    else this.node = new BNodeClient({ ...this.options, path });
  }

  /*
   * Set the wallet client for the class
   * @param {string} _path - Can set a custom path
   * @returns {void}
   */
  setWalletClient(_path = null) {
    const path = this.getClientPath('wallet');

    if (this.chain === 'handshake')
      this.wallet = new HWalletClient({ ...this.options, path });
    // defaults to returning bcoin client
    else this.wallet = new BWalletClient({ ...this.options, path });
  }

  /*
   * Set the wallet client for the class
   * @param {string} _path - Can set a custom path
   * @returns {void}
   */
  setMultisigClient(_path = null) {
    const path = this.getClientPath('multisig');

    this.multisig = new MultisigClient({ ...this.options, path });
  }

  /*
   * Get path for the client of the set id
   * @param {string} type - One of 'node', 'wallet', or 'multisig'
   * @param {string} [_path] - custom path
   * @returns {string} path - usually of format `/clients/[ID]/[TYPE]`
   * e.g. `/clients/my-node/wallet`
   */
  getClientPath(type, _path) {
    if (_path) {
      assert(typeof path === 'string');
      return _path;
    }

    assert(this.types.has(type), `Client type "${type}" is not supported`);
    assert(this.id, 'Must have a client id to get client path');

    return `${this.path}/${this.id}/${type}`;
  }
}

/**
 * Client Options
 */

class ClientOptions {
  constructor(options) {
    this.id = '';
    this.chain = null;
    this.path = null;
    this.node = null;
    this.wallet = null;
    this.multisig = null;

    if (options) this.fromOptions(options);
  }

  fromOptions(options) {
    const { id, chain, node, path, wallet, multisig } = options;

    if (id) {
      assert(typeof id === 'string');
      this.id = id;
    }

    if (chain) {
      assert(typeof chain === 'string');
      assert(
        chain === 'bitcoin' || chain === 'bitcoincash' || chain === 'handshake',
        `${chain} is not a supported chain`
      );
      this.chain = chain;
    }

    if (node) {
      assert(node instanceof Client);
      // want to make sure that the client matches with the chain
      if (this.chain === 'bitcoin' || this.chain === 'bitcoincash')
        assert(node instanceof BNodeClient);
      if (this.chain === 'handshake') assert(node instanceof HNodeClient);
      this.node = node;
    }

    if (wallet) {
      assert(wallet instanceof Client);
      // want to make sure that the client matches with the chain
      if (this.chain === 'bitcoin' || this.chain === 'bitcoincash')
        assert(wallet instanceof BWalletClient);
      if (this.chain === 'handshake') assert(wallet instanceof HWalletClient);
      this.wallet = wallet;
    }

    if (multisig) {
      assert(multisig instanceof MultisigClient);
      this.multisig = multisig;
    }

    if (path) {
      assert(typeof path === 'string');
      this.path = path;
    } else {
      // default to '/clients` as base path
      this.path = '/clients';
    }

    return this;
  }
}

export default BPClient;