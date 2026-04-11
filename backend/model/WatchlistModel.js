const mongoose = require("mongoose");
const WatchlistSchema = require("../schemas/WatchlistSchema");

const WatchlistModel = mongoose.models.Watchlist || mongoose.model("Watchlist", WatchlistSchema);

module.exports = WatchlistModel;