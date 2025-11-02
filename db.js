
const { MongoClient } = require('mongodb');
const { uri, dbName, userColl, itemColl } = require('./config'); 

const client = new MongoClient(uri);
let db;

async function connectToDb() {
  if (db) {
    const users = db.collection(userColl);
    const items = db.collection(itemColl);
    return { db, users, items };
  }

  try {
    await client.connect();
    console.log("MongoDB");

    db = client.db(dbName);

    const users = db.collection(userColl);
    const items = db.collection(itemColl);

    return { db, users, items };
  } catch (err) {
    console.error("Failed", err);
    process.exit(1);
  }
}

async function closeDb() {
  await client.close();
  console.log("Disconnected.");
}

module.exports = { connectToDb, closeDb, client };