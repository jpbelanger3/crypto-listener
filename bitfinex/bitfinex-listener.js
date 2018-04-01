const WebSocket = require('ws')
const bitfinexSocketUrl = 'wss://api.bitfinex.com/ws/2'
var activeListenerList = []
const symbolList = [
    //'tBTCUSD',
    'tLTCBTC',
    //'tETHUSD',
]

function Listener(params) {
    this.symbol = 't' + params.pair
    this.chanId = params.chanId
    this.channel = params.channel
    this.pair = params.pair

    console.log('New Listener: ' + this.pair)
}

Listener.prototype.process = function (payload) {
    console.log('\nProcess: ' + this.pair + ' ' + this.channel + '\n' + payload)
    switch (this.channel) {
        case 'ticker':
            var tick = _payloadToTick(payload)
            console.log(tick)
            break
    }
    
}

function _payloadToTick(payload) {
    var tick = {
        bid: payload[0],
        bidSize: payload[1],
        ask: payload[2],
        askSize: payload[3],
        dailyChange: payload[4],
        dailyChangePerc: payload[5],
        lastPrice: payload[6],
        volume: payload[7],
        high: payload[8],
        low: payload[9],
        timestamp: Date.now()
    }

    return tick
}

function _callListener(respObj) {
    var listener = activeListenerList.find((listener) => {
        return listener.chanId === respObj[0]
    })

    if (listener) {
        listener.process(respObj[1])
    }
}

function _handleResponse(resp) {
    var respObj = JSON.parse(resp)
    if (respObj.event === 'subscribed') {
        activeListenerList.push(new Listener(respObj))
    } else if (respObj.event === 'error') {
        console.error('ERROR: ' + resp)
    } else if (respObj.event === 'info') {
    } else {
        if (respObj[1] !== 'hb') {
            _callListener(respObj)
        }
    }
}

function _initListeners() {
    var ws = new WebSocket(bitfinexSocketUrl)
    ws.on('message',  (resp) => { _handleResponse(resp) })
    ws.on('open', () => {
        symbolList.forEach((symbol) => {
            params = {
                event: 'subscribe',
                channel: 'ticker',
                symbol: symbol,
            }
            ws.send(JSON.stringify(params))
            params.channel = 'trades'
            ws.send(JSON.stringify(params))
        })
    })
}

module.exports = {
    start: function() {
        console.log('Bitfinex listener starting')
        _initListeners()
    }
}