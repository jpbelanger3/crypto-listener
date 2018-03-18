var db = require('../mongo')

async function handleMarketHistory(marketHistory, market, params) {
    //temp
    if (!marketHistory.length) marketHistory = []
    const collection = 'Market History - ' + market
    const lastEntryOptions =  {
        sort: { TimeStamp: -1 },
        limit: 1,
    }
    var lastEntryRes = await db.find(collection, {}, lastEntryOptions)
    var lastEntry = lastEntryRes[0]
    var lastId = lastEntry ? lastEntry.Id : 0
    var newHistory = marketHistory.filter((transac) => {
        return transac.Id > lastId
    })
    if (newHistory.length > 0) {
        await db.insert('Market History - ' + market, newHistory)
    }
    return newHistory.length
}

module.exports.handleMarketHistory = handleMarketHistory