function Listener(marketName, interval, title) {
    this.marketName = marketName
    this.title = title
    this.intervalTime = interval

    this.dataFetcher = null
    this.callback = (data) => { console.log(data) }
    this.interval = null
}

Listener.prototype.setDataFetcher = function(dataFetcher, params) {
    this.dataFetcher = dataFetcher
    this.dataFetcherParams = params
}

Listener.prototype.setCallback = function(callback, params) {
    this.callback = callback
    this.callbackParams = callback
}

Listener.prototype.setIntervalTime = function(time) {
    // TODO restart interval
    this.intervalTime = time
}

Listener.prototype.start = function() {
    console.log('started')
    const self = this
    if (this.dataFetcher) {
        this.interval = setInterval(async() => {
            let data = await self.dataFetcher(self.marketName, self.dataFetcherParams)
            this.callback(data, self.marketName, self.callbackParams)
        }, self.intervalTime)
    } else {
        throw new Error('No data fetcher.')
    }
}

Listener.prototype.stop = function() {
    clearInterval(this.interval)
}

module.exports = {
    Listener: Listener,
    test: function() {
        return true
    }
}