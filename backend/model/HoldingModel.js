const mongoose = require("mongoose");
const HoldingSchema = require("../schemas/HoldingSchema");

const HoldingModel = mongoose.models.Holding || mongoose.model("Holding", HoldingSchema);

module.exports = HoldingModel;