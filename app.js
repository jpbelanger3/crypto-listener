const app = require('express')()
const http = require('http')
const socket = require('socket.io')
const config = require('config')

var bittrex = require('./bittrex')

app.set('view-engine', 'ejs')

bittrex.start()

app.get('/ping', function(req, res, next) {
    res.send('pong')
})

app.get('/bittrex', function(req, res, next) {
    var listenerData = bittrex.getState()
    res.render('bittrex-listener.ejs', listenerData)
})

app.get('/bittrex/duplicates', function(req, res, next) {
    bittrex.getDuplicatesCount()
    .then((data) => { res.send(data) })
    .catch((e) => { next(e) })
})

//const server = http.createServer()
//const io = socket(server)
app.listen(config.get('serverPort'))
