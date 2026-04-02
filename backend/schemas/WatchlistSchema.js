const mongoose = require("mongoose");

const WatchlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    name: { type: String },
    addedAt: { type: Date, default: Date.now }
});

module.exports = WatchlistSchema;