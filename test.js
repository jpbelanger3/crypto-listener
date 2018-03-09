var bittrexIndex = require('./bittrex')
var bittrexApiInterface = require('./bittrex/api-interface')
var bittrexHttpsWrapper = require('./bittrex/https-wrapper')

async function test(object, name) {
    console.log('Testing ' + name + '....')
    var success = await object.test()
    if (success) console.log('Checked!')
    else {
        console.log('ERROR')
        throw new Error('Error testing ' + name)
    }
}

async function start() {
    try {
        await test(bittrexHttpsWrapper, 'bittrexHttpsWrapper')
        await test(bittrexApiInterface, 'bittrexApiInterface')
        await test(bittrexIndex, 'bittrexIndex')  
    } catch (e) {
        console.log('Aborted: See above.')
    }
}

start()