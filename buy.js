const { connectToDb, closeDb, client } = require('./db');

async function runBuyDemo() {

  const session = client.startSession();

  try {
    session.startTransaction();
    console.log("Transaction started");

    const { users, items } = await connectToDb();

    const buyerUsername = "dumkid";
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
    await session.endSession();
    await closeDb();
  }
}

runBuyDemo();