const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
  name: String,
  qty: Number,
  currPrice: Number,
  price: Number,
  mode: String,
});

module.exports = { OrdersSchema };