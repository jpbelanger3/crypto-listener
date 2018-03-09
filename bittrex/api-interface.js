const bittrex = require('./https-wrapper')

async function _send(version, api, method, params) {
    if (!params) params = {}
    var data = {}
    try {
        data = await bittrex.sendRequest(version, api, method, params)
    } catch (e) {
        console.error(e)
    }

    return data
}

module.exports = {
    getMarkets: async function() {
        return await _send('v1.1', 'public', 'getmarkets')
    },
    getCurrencies: async function() {
        return await _send('v1.1', 'public', 'getcurrencies')
    },
    getTicker: async function(market) {
        var params = { market: market }
        return await _send('v1.1', 'public', 'getticker', params) 
    },
    getMarketSummaries: async function() {
        return await _send('v1.1', 'public', 'getmarketsummaries')
    },
    getMarketSummary: async function(market) {
        var params = { market: market }
        return await _send('v1.1', 'public', 'getmarketsummaries', params)
    },
    getOrderBook: async function(market) {
        var params = { market: market, type: 'both' }
        return await _send('v1.1', 'public', 'getorderbook', params)
    },
    getMarketHistory: async function(market) {
        var params = { market: market }
        return await _send('v1.1', 'public', 'getmarkethistory', params)
    },
    getTicks: async function(market, interval) {
        var params = {
            marketName: market,
            tickInterval: interval
        }
        return await _send('v2.0', 'pub/market', 'GetTicks', params)
    },
    getLatestTick: async function(market, interval) {
        var params = {
            marketName: market,
            tickInterval: interval
        }
        return await _send('v2.0', 'pub/market', 'GetLatestTick', params)
    },

    test: async function() {
        const market = 'BTC-ETH'
        const interval = 'oneMin'
        var success = true
        try {
            console.log('   Testing getMarkets...')
            await this.getMarkets()
            console.log('   Checked!')
            console.log('   Testing getCurrencies...')
            await this.getCurrencies()
            console.log('   Checked!')
            console.log('   Testing getTicker...')
            await this.getTicker(market)
            console.log('   Checked!')
            console.log('   Testing getMarketSummaries...')
            await this.getMarketSummaries()
            console.log('   Checked!')
            console.log('   Testing getMarketSummary...')
            await this.getMarketSummary(market)
            console.log('   Checked!')
            console.log('   Testing getOrderBook...')
            await this.getOrderBook(market)
            console.log('   Checked!')
            console.log('   Testing getMarketHistory...')
            await this.getMarketHistory(market)
            console.log('   Checked!')
            console.log('   Testing getTicks...')
            await this.getTicks(market, interval)
            console.log('   Checked!')
            console.log('   Testing getLatestTick...')
            await this.getLatestTick(market, interval)
            console.log('   Checked!')
        } catch(e) {
            console.error(e)
            success = false
        }

        return success
    }
}