import { assert } from 'chai';
const url = require('url');
const fetch = require('node-fetch');

import {
  BlockExplorerClient,
  BLOCK_EXPLORERS,
  EXPLORER_SUFFIXES,
} from '../lib/blockExplorerClient.js';

describe('Block Explorer Client', () => {
  it('Should instantiate from options', () => {

    const client = BlockExplorerClient.fromOptions({
      protocol: 'bitcoin',
      chain: 'main',
    });

    assert.ok(client);
  });

  it('Should return transaction urls', () => {

    const chain = 'main';
    const protocol = 'bitcoin';
    const txhash = 'foobar';

    const client = BlockExplorerClient.fromOptions({
      protocol,
      chain,
    });

    const links = client.getTransactionLinks(txhash);

    const suffixes = client.getSuffixes();

    for (let link of links)
      assert.equal(link.href.includes(txhash), true, 'it should render with the tx hash');
  });
});

