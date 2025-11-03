const { connectToDb, closeDb, client } = require('./db');

async function runBuyDemo() {
  console.log("Starting 'Buy' transaction demo...");

  const session = client.startSession();
  const buyerUsername = "dumkid"; 

  try {
    session.startTransaction();
    console.log("Transaction started");

    const { users, items } = await connectToDb();

    const itemSku = "ENDER_FLAME_01";
    const itemName = "Ender Flame Skin";
    const itemCost = 1000;

    const buyer = await users.findOne({ username: buyerUsername }, { session });

    if (!buyer) {
      throw new Error(`User ${buyerUsername} not found.`);
    }

    if (buyer.currency_balance < itemCost) {
      throw new Error("Insufficient funds.");
    }

    const updateUserResult = await users.updateOne(
      { _id: buyer._id },
      { $inc: { currency_balance: -itemCost } },
      { session } 
    );

    console.log(`1. User balance updated`);

    const createItemResult = await items.insertOne(
      {
        owner_user_id: buyer._id,
        item_sku: itemSku,
        item_name: itemName,
        cost_paid: itemCost
      },
      { session } 
    );

    console.log(`2. Item created with ID: ${createItemResult.insertedId}`);

 
    await session.commitTransaction();
    console.log("Transaction successful");

  } catch (error) {
    console.error("error :", error.message);
    await session.abortTransaction();
    console.log("Transaction aborted.");

  } finally {
    console.log("Checking final balance...");
    try {
      const { users } = await connectToDb();
      const user = await users.findOne({ username: buyerUsername });
      if (user) {
        console.log(`User '${user.username}' final balance: ${user.currency_balance}`);
      } else {
        console.log(`Could not find user ${buyerUsername}.`);
      }
    } catch (err) {
      console.error("Error checking final balance:", err.message);
    }

    await session.endSession();
    await closeDb();
  }
}

runBuyDemo();