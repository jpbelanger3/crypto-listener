const app = require('express')()
const http = require('http')
const socket = require('socket.io')
const config = require('config')

var listener = require('./bitfinex-listener')
var bittrex = require('./bittrex')

bittrex.start()
//listener.start()


app.get('/ping', function(req, res, next) {
    res.send('pong')
})

//const server = http.createServer()
//const io = socket(server)
app.listen(config.get('serverPort'))
