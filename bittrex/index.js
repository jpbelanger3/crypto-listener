var bittrex = require('./api-interface')
var Listener = require('./listener').Listener
var db = require('../mongo')
var dataHandler = require('./data-handler')

var markets = []
var currencies = []
var chosenMarkets = []
var activeListeners = []

async function _init(chosenMarketNameList) {
    var initialPromises = [
        bittrex.getMarkets(),
        bittrex.getCurrencies(),
    ]
    var resultList = await Promise.all(initialPromises)
    markets = resultList[0]
    currencies = resultList[1]

    markets.forEach((market) => {
        if(chosenMarketNameList.includes(market.MarketName)) {
            chosenMarkets.push(market)
            db.createCollectionIfNotExist('Market History - ' + market.MarketName)
            let listener = new Listener(market.MarketName, 5000, 'Market History')
            listener.setDataFetcher(bittrex.getMarketHistory)
            listener.setCallback(dataHandler.handleMarketHistory)
            activeListeners.push(listener)
        }
    })

    console.log(chosenMarkets)
}

module.exports = {
    start: async function() {
        await _init(['BTC-ZCL'])
        markets.sort((a, b) =>  { 
            let res
            if (a.MarketName < b.MarketName) res = -1
            else res = 1
            return res
        })
        /*markets.forEach((market) => {
            console.log(market.MarketName)
        })*/

        activeListeners.forEach((listener) => { listener.start() })
    },
    test: async function() {
        return true
    }
}