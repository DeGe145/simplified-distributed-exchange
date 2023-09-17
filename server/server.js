// 'use strict'

const { PeerRPCServer }  = require('grenache-nodejs-http')


// function fibonacci (n) {
//   if (n <= 1) {
//     return 1
//   }
//   return fibonacci(n - 1) + fibonacci(n - 2)
// }



// setInterval(() => {
//   link.announce('simplified_distributed_exchange', service.port, {})
// }, 1000)

// service.on('request', (rid, key, payload, handler) => {
//   const result = fibonacci(payload.number)
//   handler.reply(null, result)
// })


const Link = require('grenache-nodejs-link')

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCServer(link, {
  timeout: 300000
})
peer.init()

const port = 1024 + Math.floor(Math.random() * 1000)
const service = peer.transport('server')
service.listen(port)


setInterval(function () {
  link.announce('simplified_distributed_exchange', service.port, {})
}, 1000)

service.on('request', (rid, key, payload, handler) => {
  console.log(payload)
  handler.reply(null, 'recieved order')
})