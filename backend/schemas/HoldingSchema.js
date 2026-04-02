const mongoose = require("mongoose");

const HoldingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    name: { type: String },
    quantity: { type: Number, required: true },
    avgPrice: { type: Number, required: true }
});

module.exports = HoldingSchema;