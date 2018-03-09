const mongoClient = require('mongodb').MongoClient

const url = 'mongodb://localhost:27017'
const dbName = 'crypto'

async function createCollectionIfNotExist(collectionName) {
    const client = await mongoClient.connect(url)
    const db = client.db(dbName)
    const collectionList = await db.command({ listCollections: 1 })
    let isInList = false
    collectionList.cursor.firstBatch.forEach((collection) => {
        if (collection.name === collectionName) isInList = true
    })

    if (!isInList) {
        await db.createCollection(collectionName)
    }

    client.close()
}

async function insert(collectionName, data) {
    const client = await mongoClient.connect(url)
    const db = client.db(dbName)
    const collection = db.collection(collectionName)
    
    const insertResult = await collection.insert(data)

    client.close()
    return insertResult
}

async function find(collectionName, query, options) {
    const client = await mongoClient.connect(url)
    const db = client.db(dbName)
    const collection = db.collection(collectionName)

    var findResult

    if(options.sort && options.limit) {
        findResult = await collection.find(query).sort(options.sort).limit(options.limit).toArray()
    } else if(options.sort) {
        findResult = await collection.find(query).sort(options.sort).toArray()
    } else {
        findResult = await collection.find(query).toArray()
    }

    client.close()
    return findResult
}

async function update(collectionName, filter, updateObj) {
    const client = await mongoClient.connect(url)
    const db = client.db(dbName)
    const collection = db.collection(collectionName)

    const updateResult = await collection.update(filter, updateObj)

    client.close()
    return updateResult
}

module.exports.createCollectionIfNotExist = createCollectionIfNotExist
module.exports.insert = insert
module.exports.find = find
module.exports.update = update