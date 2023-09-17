class Order {
    constructor(orderId, symbol, txnType, price, quantity, clientId) {
        this.orderId = orderId;
        this.symbol = symbol;
        this.txnType = txnType; // 'buy' or 'sell'
        this.price = price;
        this.quantity = quantity;
        this.clientId = clientId;
        this.status = 'open'; // open, locked, executed.
        this.matchedId = undefined;
        this.created_at = new Date().toISOString();
        this.updated_at = new Date().toISOString();
    }
}

class OrderBook {
    constructor() {
        this.orders = {}; // { symbol: { buy: [], sell: [] } }
        this.mutex = {}; // { symbol: { buy: false, sell: false } }
    }

    async addOrder(order) {
        if (!this.orders[order.symbol]) {
            this.orders[order.symbol] = { buy: [], sell: [] };
            this.mutex[order.symbol] = { buy: false, sell: false };
        }

        await this.acquireMutex(order.symbol, order.txnType);

        try {
            if (order.txnType === 'buy') {
                this.orders[order.symbol].buy.push(order);
                this.matchOrders(order.symbol, order, 'sell');
            } else if (order.txnType === 'sell') {
                this.orders[order.symbol].sell.push(order);
                this.matchOrders(order.symbol, order, 'buy');
            }
        } finally {
            this.releaseMutex(order.symbol, order.txnType);
        }
    }

    matchOrders(order) {
        const matchingOrder = Object.assign(order);
        const symbol = order.symbol;
        const opposingTxnType = order.txnType === 'buy' ? 'sell' : 'buy';
        if (
            this.orders[symbol] &&
            this.orders[symbol][opposingTxnType].length > 0
        ) {
            // Sort orders of opposing txn_type
            this.orders[symbol][opposingTxnType].sort((a, b) =>
                opposingTxnType === 'buy' ? b.price - a.price : a.price - b.price
            );

            const opposingOrders = this.orders[symbol][opposingTxnType];
            const matchedOrders = [];

            for (let i = 0; i < opposingOrders.length; i++) {
                if (opposingOrders[i].status === 'locked') continue
                if (opposingOrders[i].quantity === 0) continue;
                if (matchingOrder.quantity === 0) break;

                if (
                    (opposingTxnType === 'buy' && matchingOrder.price <= opposingOrders[i].price) ||
                    (opposingTxnType === 'sell' && matchingOrder.price >= opposingOrders[i].price)
                ) {
                    const matchedQuantity = Math.min(matchingOrder.quantity, opposingOrders[i].quantity);


                    matchedOrders.push({
                        buyer: opposingTxnType === 'buy' ? matchingOrder : opposingOrders[i],
                        seller: opposingTxnType === 'buy' ? opposingOrders[i] : matchingOrder,
                        price: opposingOrders[i].price,
                        quantity: matchedQuantity,
                    });


                    matchingOrder.previousQuantity = matchingOrder.quantity;
                    matchingOrder.previousUpdatedat = matchingOrder.updated_at;
                    opposingOrders.previousQuantity = opposingOrders.quantity;
                    opposingOrders.previousUpdatedat = opposingOrders.updated_at;
                    matchingOrder.quantity -= matchedQuantity;
                    opposingOrders[i].quantity -= matchedQuantity;
                }
            }

            const txn_time = new Date().toISOString();

            // Handle matched orders here (create trades)
            matchedOrders.forEach(({ buyer, seller, price, quantity }) => {
                buyer.status = 'locked';
                seller.status = 'locked';
                buyer.matchedId = seller.orderId;
                seller.matchedId = buyer.orderId;
                buyer.updated_at = txn_time;
                seller.updated_at = txn_time;
                console.log(`Matched order: ${buyer.txnType} ${quantity} ${buyer.symbol} at ${price}`);
            });
        }
    }

    async acquireMutex(symbol, txnType) {
        while (this.mutex[symbol][txnType]) {
            await new Promise((resolve) => setTimeout(resolve, 10));
        }
        this.mutex[symbol][txnType] = true;
    }

    releaseMutex(symbol, txnType) {
        this.mutex[symbol][txnType] = false;
    }

    getOrderBook(symbol) {
        return this.orders[symbol] || { buy: [], sell: [] };
    }
}

module.exports = { OrderBook, Order }