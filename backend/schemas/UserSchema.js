const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  balance: { type: Number, default: 50000 },

  refreshTokens: [String],

  stocks: {
    holdings: [
      {
        symbol: String,
        name: String,
        quantity: Number,
        avgPrice: Number
      }
    ],
    watchlist: [
      {
        symbol: String,
        name: String
      }
    ],
    orders: [
      {
        symbol: String,
        type: String,
        quantity: Number,
        price: Number,
        status: String,
        date: { type: Date, default: Date.now }
      }
    ]
  }
});

module.exports = UserSchema; 