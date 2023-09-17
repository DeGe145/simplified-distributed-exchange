// 'use strict'

const { PeerRPCClient } = require('grenache-nodejs-http')

const Link = require('grenache-nodejs-link')
const { OrderBook, Order } = require('./order/orderBook')
const crypto = require('crypto')

class Client {
  constructor() {
    this.clientId = crypto.randomUUID();
    this.orderBook = new OrderBook();
    this.peer = this.initPeer()
  }

  initPeer() {
    const link = new Link({
      grape: 'http://127.0.0.1:30001',
      requestTimeout: 10000
    })
    link.start()

    const peer = new PeerRPCClient(link, {})
    peer.init()
    return peer;
  }

  async createOrder(orderId, symbol, txnType, price, quantity, clientId) {
   const order = new Order(orderId, symbol, txnType, price, quantity, clientId);
   console.log('1', order)
   await this.orderBook.addOrder(order);
   return order;
  }

  createOrderPayload(order){
    return {
      client: this.clientId,
      type: 'order',
      data: order,
    }
  }

  sendRequest(payload) {
    this.peer.request('simplified_distributed_exchange', payload, { timeout: 10000 }, (err, data) => {
      if (err) {
        console.error(err)
        process.exit(-1)
      }
      console.log(data) // world
    })
  }
}

async function simulateClients() {
  const client = new Client();
  const orderId = crypto.randomUUID();
  const symbol = 'ETH/USD';
  const txnType = 'buy'; 
  const price = 2150;
  const quantity = 10;
  const clientId = this.clientId;

  const order = await client.createOrder(orderId, symbol, txnType, price, quantity, clientId);
  console.log('2', order)

  const payload = client.createOrderPayload(order);
  client.sendRequest(payload);

}

simulateClients().catch(console.error);