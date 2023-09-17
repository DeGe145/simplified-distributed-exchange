# simplified-distributed-exchange

Bitfinex challenge Node, blockchain

## Installation

From root folder

```bash
npm i -g grenache-grape
npm install
```

## Usage

```node
// Start 2 Grapes
grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'
grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'
```
From Server directory

```
node server.js
```

From Client directory

```
node client.js
```

This will create two orders after running through matching logic.
And provide current status of orderBook.

This will also send the order as payload to server

## TODO
On Client
1. Add function to send updated orderBook to server.
2. Add logic to remove lock and create trades from locked orders - change status to exectued. (To avoid race condition using lock and timestamp)
3. Create tradeBook to register executed trades 

On Server
1. Send orders to all clients to update their orderBook.

