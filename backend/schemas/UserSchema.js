const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
    unique: true
  },

  password: String,

  refreshTokens: [String],

  stocks: {
    type: {
      holdings: {
        type: [
          {
            symbol: String,
            name: String,
            quantity: Number,
            avgPrice: Number
          }
        ],
        default: []
      },

      watchlist: {
        type: [
          {
            symbol: String,
            name: String
          }
        ],
        default: []
      },

      orders: {
        type: [
          {
            symbol: String,
            type: String,
            quantity: Number,
            price: Number,
            status: String,
            date: { type: Date, default: Date.now }
          }
        ],
        default: []
      }
    },

    default: () => ({
      holdings: [],
      watchlist: [],
      orders: []
    })
  }
});

module.exports = UserSchema;