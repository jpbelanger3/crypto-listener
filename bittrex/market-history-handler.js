var db = require('../mongo')

function MarketHistoryHandler(market) {
    this.lastEntryId = 0
    this.market = market
    this.collection = 'Market History - ' + market
}

MarketHistoryHandler.prototype.init = async function() {
    const lastEntryOptions =  {
        sort: { TimeStamp: -1, Id: -1 },
        limit: 1,
    }
    var lastEntryRes = await db.find(this.collection, {}, lastEntryOptions)
    if (lastEntryRes.length) this.lastEntryId = lastEntryRes[0].Id
}

MarketHistoryHandler.prototype.handle = async function(marketHistory) {
    if (!marketHistory || !marketHistory.length) marketHistory = []
    var newHistory = marketHistory.filter((transac) => {
        return transac.Id > this.lastEntryId
    })
    if (newHistory.length > 0) {
        this.lastEntryId = newHistory[0].Id
        await db.insert(this.collection, _parseMarketHistoryData(newHistory))
    }
    return newHistory.length
}

function _parseMarketHistoryData(marketHistory) {
    return marketHistory.map((transac) => {
        transac.TimeStamp = new Date(transac.TimeStamp).getTime()
        transac.Fill = transac.FillType === 'FILL'
        //transac.PartialFill = transac.FillType === 'PARTIAL_FILL'
        transac.Buy = transac.OrderType === 'BUY'
        //transac.Sell = transac.OrderType === 'SELL'
        delete transac.FillType
        delete transac.OrderType
        return transac
    })
}

module.exports = {
    MarketHistoryHandler: MarketHistoryHandler
}