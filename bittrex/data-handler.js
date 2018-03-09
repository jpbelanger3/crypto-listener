var db = require('../mongo')

async function handleMarketHistory(marketHistory, market, params) {
    //temp
    const collection = 'Market History - ' + market
    const lastEntryOptions =  {
        sort: { TimeStamp: -1 },
        limit: 1,
    }
    var lastEntry = await db.find(collection, {}, lastEntryOptions)
    console.log(lastEntry)
    //marketHistory.forEach()
}

module.exports.handleMarketHistory = handleMarketHistory