const { connectToDb, closeDb, client } = require('./db');

async function runSellDemo() {
  console.log("Starting 'Sell' transaction demo...");

  const session = client.startSession();

  try {
    session.startTransaction();
    console.log("Transaction started...");

    const { users, items } = await connectToDb();

    const sellerUsername = "dumkid";
    const itemSkuToSell = "ENDER_FLAME_01";
    const refundAmount = 800; 

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

    console.log(`1. Item ${itemToSell.item_name} deleted...`);

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
    await session.endSession();
    await closeDb();
  }
}

runSellDemo();