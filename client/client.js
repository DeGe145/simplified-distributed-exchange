// 'use strict'

const { PeerRPCClient }  = require('grenache-nodejs-http')

const Link = require('grenache-nodejs-link')

const link = new Link({
  grape: 'http://127.0.0.1:30001',
  requestTimeout: 10000
})
link.start()

const peer = new PeerRPCClient(link, {})
peer.init()

peer.request('simplified_distributed_exchange', 'hello', { timeout: 10000 }, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(-1)
  }
  console.log(data) // world
})