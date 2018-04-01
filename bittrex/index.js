var bittrex = require('./api-interface')
var Listener = require('./listener').Listener
var db = require('../mongo')
var MarketHistoryHandler = require('./market-history-handler').MarketHistoryHandler

var markets = []
var currencies = []
var marketSummaries = []
var chosenMarkets = []
var activeListeners = []

async function _init(chosenMarketNameList) {
    var initialPromises = [
        bittrex.getMarkets(),
        bittrex.getCurrencies(),
        bittrex.getMarketSummaries(),
    ]
    var resultList = await Promise.all(initialPromises)
    markets = resultList[0]
    currencies = resultList[1]
    marketSummaries = resultList[2]
    var listenerList = []
    for (let index = 0; index < marketSummaries.length; index++) {
        const market = marketSummaries[index]
        if(chosenMarketNameList === 'all' || chosenMarketNameList.includes(market.MarketName)) {
            let time = calculStartingTime(market)
            if (time > 0) {
                let listener = new Listener(market.MarketName, time, 'Market History')
                listener.setDataFetcher(bittrex.getMarketHistory)
                listener.setHandler(new MarketHistoryHandler(market.MarketName))
                listenerList.push(listener)
            }
        }
    }
    
    console.log('STARTED FOR: ', chosenMarketNameList)
    return listenerList
}

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)

    minutes = (minutes < 10) ? "0" + minutes : minutes
    seconds = (seconds < 10) ? "0" + seconds : seconds

    return minutes + " m " + seconds + "." + milliseconds + ' s '
}

function calculStartingTime(market) {
    const max =  15 * 60 * 1000
    const min = 1000
    var time
    if (market.BaseVolume === 0) {
        time = 0
        console.log('VOLUME 0 : ' + market.MarketName)
    }
    if (market.MarketName === 'USDT-BTC') {
        time = min * 5
    } else if (market.MarketName.includes('USDT-')) {
        time = max / (market.BaseVolume * 0.00004)
    } else if (market.MarketName.includes('ETH-')) {
        time = max / (market.BaseVolume * 0.03)
    } else if (market.MarketName.includes('BTC-')) {
        time = max / (market.BaseVolume * 0.15)
    } else {
        time = 0
        console.log('NOT RECOGNIZED BASE : ' + market.MarketName)
    }
    //console.log(market.MarketName + ' : TIME :' + time)
    if (time < min) time = min
    else if (time > max) time = max
    return time
}

module.exports = {
    start: async function() {
        //activeListeners = await _init(['BTC-ADA', 'USDT-BTC', 'BTC-NBT'])
        activeListeners = await _init('all')
        activeListeners.forEach((listener) => { listener.start() })
    },
    test: async function() {
        return true
    },
    getState: function() {
        var data = {}
        data.listenerList = activeListeners.map((listener) => {
            var mapped = {}
            mapped.title = listener.title + ' - ' + listener.marketName
            mapped.intervalTime = msToTime(listener.intervalTime)
            return mapped
        }).sort((a, b) => {
            var res = 0
            if (a.intervalTime < b.intervalTime) res = -1
            if (a.intervalTime > b.intervalTime) res = 1
            return res
        })
        return data
    },
    getDuplicatesCount: function() {
        return Promise.all(activeListeners.map((listener) => {
            return db.findDuplicates(listener.title + ' - ' + listener.marketName, 'Id')
        })).then((data) => {
            return data.filter((arr) => { return arr.length > 0 })
        })
    }
}