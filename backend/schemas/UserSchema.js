const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

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
        placedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  }
});

module.exports = mongoose.model("User", UserSchema);