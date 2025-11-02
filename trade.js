
const { connectToDb, closeDb, client } = require('./db');

async function runTradeDemo() {
  console.log("Starting 'P2P Trade' transaction");

  const session = client.startSession();

  try {
    session.startTransaction();
    console.log("Transaction started...");

    const { users, items } = await connectToDb();

    const sellerUsername = "dumkid";
    const buyerUsername = "bond007";
    const itemSkuToTrade = "ENDER_FLAME_01";
    const tradePrice = 500;

    const seller = await users.findOne({ username: sellerUsername }, { session });
    const buyer = await users.findOne({ username: buyerUsername }, { session });
    
    if (!seller || !buyer) {
      throw new Error("One or more users not found.");
    }

    const itemToTrade = await items.findOne(
      { item_sku: itemSkuToTrade, owner_user_id: seller._id },
      { session }
    );

    if (!itemToTrade) {
      throw new Error(`Seller ${sellerUsername} does not own item ${itemSkuToTrade}.`);
    }

    if (buyer.currency_balance < tradePrice) {
      throw new Error(`Buyer ${buyerUsername} has insufficient funds.`);
    }

    await users.updateOne(
      { _id: seller._id },
      { $inc: { currency_balance: tradePrice } },
      { session }
    );
    console.log(`1. Seller ${sellerUsername}'s balance updated...`);

    await users.updateOne(
      { _id: buyer._id },
      { $inc: { currency_balance: -tradePrice } },
      { session }
    );
    console.log(`2. Buyer ${buyerUsername}'s balance updated...`);

    await items.updateOne(
      { _id: itemToTrade._id },
      { $set: { owner_user_id: buyer._id } },
      { session }
    );
    console.log(`3. Item ${itemToTrade.item_name} owner updated...`);

    await session.commitTransaction();
    console.log("Transaction committed successfully! The trade is complete.");

  } catch (error) {
    console.error("An error occurred:", error.message);
    await session.abortTransaction();
    console.log("Transaction aborted.");

  } finally {
    await session.endSession();
    await closeDb();
  }
}

runTradeDemo();