
const { connectToDb, closeDb } = require('./db');

async function runSetup() {

  let db, users, items;

  try {
    ({ db, users, items } = await connectToDb());

    console.log("Clearing old data");
    await users.deleteMany({});
    await items.deleteMany({});

    const startingUsers = [
      {
        username: "dumkid",
        currency_balance: 1500
      },
      {
        username: "bond007",
        currency_balance: 1500
      }
    ];

    const result = await users.insertMany(startingUsers);

    console.log(`${result.insertedCount} users were created:`);
    console.log(await users.find().toArray());

  } catch (error) {
    console.error("error: ", error);
  } finally {
    await closeDb();
  }
}

runSetup();