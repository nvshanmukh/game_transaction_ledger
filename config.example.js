const uri = "mongodb+srvgame_admin:<password>@game-ledger-project.xxxxx.mongodb.net/?retryWrites=true&w=majority";

const dbName = "gameDB";

const userColl = "users";
const itemColl = "user_items";

module.exports = {
  uri,
  dbName,
  userColl,
  itemColl
};