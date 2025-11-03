const { connectToDb, closeDb, client } = require('./db');

async function runFailDemo() {
  const session = client.startSession();

  const { db, users, items } = await connectToDb();
  await items.deleteMany({});
  await items.insertOne({
    _id: "UNIQUE_ITEM_ID_123",
    item_name: "Test Item"
  });
  console.log("Setup: Created a test item with a unique ID.");

  try {
    session.startTransaction();
    console.log("Transaction started...");

    const buyerUsername = "dumkid";
    const itemCost = 100;

    const updateUserResult = await users.updateOne(
      { username: buyerUsername },
      { $inc: { currency_balance: -itemCost } },
      { session }
    );
    
    if (updateUserResult.modifiedCount === 0) {
      throw new Error("User not found or balance not updated.");
    }
    console.log(`1. User balance updated (in-memory)...`);

    console.log("2. Attempting to create a new item with a duplicate ID...");
    await items.insertOne(
      {
        _id: "UNIQUE_ITEM_ID_123", 
        item_name: "Duplicate Item"
      },
      { session }
    );

    await session.commitTransaction();
    console.log("Transaction committed (THIS SHOULD NOT HAPPEN).");

  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
    
    await session.abortTransaction();
    console.log("Transaction aborted. Rollback initiated.");

  } finally {
    console.log("Checking user's balance post-rollback...");
    const user = await users.findOne({ username: "dumkid" });
    
    console.log(`User 'dumkid' final balance: ${user.currency_balance}`);
    console.log("Note: This balance should be the same as before the script was run.");

    await session.endSession();
    await closeDb();
  }
}

runFailDemo();