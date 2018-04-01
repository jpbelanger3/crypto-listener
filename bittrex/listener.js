const maxTime = 15 * 60 * 1000
const minTime = 1000

function Listener(marketName, interval, title) {
    this.marketName = marketName
    this.title = title
    this.intervalTime = interval

    this.tickCount = 0
    this.newDataCount
    this.isFirst = true

    this.dataFetcher = null
    this.handler = {
        handle: (data) => { console.log(data) }
    }
    this.interval = null
}

Listener.prototype.setDataFetcher = function(dataFetcher, params) {
    this.dataFetcher = dataFetcher
    this.dataFetcherParams = params
}

Listener.prototype.setHandler = function(handler, params) {
    this.handler = handler
    this.handlerParams = params
}

Listener.prototype.setIntervalTime = function(time) {
    this.intervalTime = time
    this.stop()
    this.start(true)
    //console.log(this.marketName + ' : RESTARTED  WITH TIME: ' + time/1000 + ' s')
}

Listener.prototype.start = async function(skipHandlerInit) {
    //console.log(this.marketName + ' : STARTED')
    if (!skipHandlerInit) await this.handler.init()
    const self = this
    this.tick()
    if (this.dataFetcher) {
        this.interval = setInterval(() => { self.tick() }, self.intervalTime)
    } else {
        throw new Error('No data fetcher.')
    }
}

Listener.prototype.stop = function() {
    clearInterval(this.interval)
}

Listener.prototype.tick = async function() {
    let data = await this.dataFetcher(this.marketName, this.dataFetcherParams)
    var dataCount = await this.handler.handle(data, this.marketName, this.handlerParams)
    this.tickCount++

    if (!this.isFirst && (dataCount || dataCount === 0)) {
        this.newDataCount += dataCount
        var ratio = this.calulateRatio(dataCount)
        if (ratio !== 1) this.setIntervalTime(this.intervalTime * ratio)
    }
    this.isFirst = false
}

Listener.prototype.calulateRatio = function(count) {
    //console.log(this.marketName + ' : NEW DATA COUNT: ' + count)
    var ratio = 1
    if (this.tickCount === 5) {
        if (this.newDataCount < 4) ratio = 1.2 
        else if (this.newDataCount > 10) ratio = 0.75
        this.newDataCount = 0
        this.tickCount = 0
    }
    if (count > 5) {
        ratio = 0.5
        this.newDataCount = 0
        this.tickCount = 0
    }
    if (ratio * this.intervalTime > maxTime) {
        ratio = maxTime / this.intervalTime
    } else if (ratio * this.intervalTime < minTime) {
        ratio = minTime / this.intervalTime
    }

    return ratio
}

module.exports = {
    Listener: Listener,
    test: function() {
        return true
    }
}