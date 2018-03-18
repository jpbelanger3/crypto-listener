const https = require('https')
const config = require('config')
const crypto = require('crypto')
const qs = require('qs')

const baseHost = 'bittrex.com'
const basePath = '/api/'
const apiKey = config.get('bittrexApiKey')
const apiSecret = config.get('bittrexApiSecret')

function sendRequest(version, api, method, params) {
    params.apikey = apiKey
    if (version === 'v2.0') params._ = Date.now()
    else params.nonce = Date.now()
    var path = basePath + version + '/' + api + '/' + method + '?' + qs.stringify(params)
    var apiSign = _calculateHmac('https://' + baseHost + path)
    var options = {
        hostname: baseHost,
        path: path,
        headers: { "apisign": apiSign } 
    }

    return new Promise((resolve, reject) => {
        var data = ''
        var req = https.request(options, function(res){
            res.on('data', (d) => { data += d })
            res.on('end', () => {
                var parsedData = {} 
                try {
                    parsedData = JSON.parse(data)
                } catch(e) {
                    reject('ERROR : Error parsing ' + data)
                }
                
                if (parsedData.success === true) resolve(parsedData.result)
                else reject('ERROR : Bittrex responded with "' + parsedData.message + '"') 
            })
        })
        req.on('error', (e) => {
            console.error(e)
        })
        req.end()
    })
}

function _calculateHmac(str) {
    const hmac = crypto.createHmac('sha512', apiSecret)    
    hmac.update(str)
    return hmac.digest('hex')
}

module.exports = {
    sendRequest: sendRequest,
    test: async function() {
        var params = {}
        var success = false
        try {
            var data = await sendRequest('v1.1', 'account', 'getbalances', params)
            success = true
        } catch (e) {
            success = false
        }

        return success
    }
}
