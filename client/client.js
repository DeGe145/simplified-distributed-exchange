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
    await this.orderBook.addOrder(order);
    return order;
  }

  createOrderPayload(order) {
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
  let client = new Client();
  let orderId = crypto.randomUUID();
  let symbol = 'ETH/USD';
  let txnType = 'buy';
  let price = 2200;
  let quantity = 10;
  let clientId = this.clientId;

  let order = await client.createOrder(orderId, symbol, txnType, price, quantity, clientId);
  let payload = client.createOrderPayload(order);
  client.sendRequest(payload);

  client = new Client();
  orderId = crypto.randomUUID();
  symbol = 'ETH/USD';
  txnType = 'sell';
  price = 2150;
  quantity = 10;
  clientId = this.clientId;

  order = await client.createOrder(orderId, symbol, txnType, price, quantity, clientId);
  payload = client.createOrderPayload(order);
  client.sendRequest(payload);

  console.log(client.orderBook.getOrderBook('ETH/USD'));
}

simulateClients().catch(console.error);