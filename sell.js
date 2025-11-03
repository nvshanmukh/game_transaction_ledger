const { connectToDb, closeDb, client } = require('./db');

async function runSellDemo() {

  const session = client.startSession();
  const sellerUsername = "dumkid"; 

  try {
    session.startTransaction();
    console.log("Transaction started...");

    const { users, items } = await connectToDb();

    const itemSkuToSell = "ENDER_FLAME_01";
    const refundAmount = 600; 

    const seller = await users.findOne({ username: sellerUsername }, { session });
    if (!seller) {
      throw new Error(`User ${sellerUsername} not found.`);
    }

    const itemToSell = await items.findOne(
      { item_sku: itemSkuToSell, owner_user_id: seller._id },
      { session }
    );

    if (!itemToSell) {
      throw new Error(`User does not own item ${itemSkuToSell}.`);
    }

    const deleteItemResult = await items.deleteOne(
      { _id: itemToSell._id },
      { session }
    );

    console.log(`1. Item ${itemToSell.item_name || itemSkuToSell} deleted...`);

    const updateUserResult = await users.updateOne(
      { _id: seller._id },
      { $inc: { currency_balance: refundAmount } },
      { session } 
    );

    console.log(`2. User balance updated...`);

    await session.commitTransaction();
    console.log("Transaction committed successfully!");

  } catch (error) {
    console.error("An error occurred:", error.message);
    await session.abortTransaction();
    console.log("Transaction aborted.");

  } finally {
    console.log("Checking final balance...");
    try {
      const { users } = await connectToDb(); // Re-connect to get fresh data
      const user = await users.findOne({ username: sellerUsername });
      if (user) {
        console.log(`User '${user.username}' final balance: ${user.currency_balance}`);
      } else {
        console.log(`Could not find user ${sellerUsername}.`);
      }
    } catch (err) {
      console.error("Error checking final balance:", err.message);
    }

    await session.endSession();
    await closeDb();
  }
}

runSellDemo();