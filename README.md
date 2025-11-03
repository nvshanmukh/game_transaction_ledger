#  Transactional Game Ledger

This project demonstrates multi-document ACID transactions in MongoDB by simulating a simple game economy.

>  It includes scripts for:
>
> - Buying an item from a store.
> - Selling an item back to the store.
> - Trading an item between two players.
> - Failing a transaction to prove automatic rollback.

---

##  How to Run Locally

### Prerequisites

- **Node.js:** You must have Node.js installed on your computer.
- **MongoDB Atlas:** You need a free MongoDB Atlas account.

### Step 1: Clone & Install

Clone this repository and install the dependencies.

```bash
git clone https://github.com/nvshanmukh/game_transaction_ledger
cd game_ledger
npm install
```

### Step 2: Create `config.js`

This project uses a `config.js` file to hold your database password.

1. Find the file `config.example.js`.
2. Make a copy of it and rename the copy to `config.js`.
3. Open `config.js` and paste in your MongoDB Atlas connection string.
4. Replace `<password>` with your actual database user password.

### Step 3: Whitelist Your IP in MongoDB Atlas

Your script will fail to connect unless you allow your computer's IP address to access your database.

1. Go to your MongoDB Atlas dashboard.
2. On the left, click "Network Access".
3. Click "Add IP Address".
4. Click "Allow Access From My Current IP Address" and confirm.

---

##  Demonstration Sequence

To see the full story, run the scripts in your terminal in this order.

### 1. Setup the Database

This script clears the database and creates our two users: `dumkid` and `bond007`.

```bash
node setup-database.js
```

**Expected Output:**

```
Clearing old data
2 users were created:
[
  { _id: ..., username: 'dumkid', currency_balance: 1500 },
  { _id: ..., username: 'bond007', currency_balance: 1500 }
]
Disconnected.
```

### 2. Buy an Item

`dumkid` buys an "Ender Flame Skin" for 1000 currency.

```bash
node buy.js
```

**Expected Output:**

```
Transaction started
MongoDB
1. User balance updated
2. Item created with ID: ...
Transaction successful
Disconnected.
```

### 3. Sell an Item

`dumkid` sells an "Ender Flame Skin" for 600 currency.

```bash
node sell.js
```

**Expected Output:**

```
Transaction started...
1. Item Ender Flame Skin deleted...
2. User balance updated...
Transaction committed successfully!
Checking final balance...
User 'dumkid' final balance: 1100
Disconnected.
```

### 4. Trade Item

`dumkid` sells the "Ender Flame Skin" to `bond007` for 600 currency.

```bash
node trade.js
```

**Expected Output:**

```
Starting 'P2P Trade' transaction
Transaction started...
1. Seller dumkid's balance updated...
2. Buyer bond007's balance updated...
3. Item Ender Flame Skin owner updated...
Transaction committed successfully! The trade is complete.
Checking final balances...
User 'dumkid' final balance: 1300
User 'bond007' final balance: 900
Disconnected.
```

- At this point: `dumkid` has 1000 (1500-1000+800), `bond007` has 1000 (1500-800), and `bond007` owns the item.

### 5. Prove the "Rollback"

This is the most important test. It proves that if an error happens, the user's money is safe.

```bash
node fail.js
```

**Expected Output:**

```
Transaction started
1. User balance updated (in-memory)...
2. Attempting to create a new item with a duplicate ID...
An error occurred: E11000 duplicate key error collection: ...
Transaction aborted. Rollback initiated.
Checking user's balance post-rollback...
User 'dumkid' final balance: 1000
Disconnected.
```

- **Result:** The script tried to subtract 100 from `dumkid` (1000 -> 900), but it failed. The final balance is still 1000, proving the transaction was rolled back.

---

##  Author

- **Shanmukh Venkata Nutulapati**
- Email: nvshanmukh28@gmail.com
- GitHub: [nvshanmukh](https://github.com/nvshanmukh)
