const mongoose = require("mongoose");
const UserSchema = require("../schemas/UserSchema"); // now correctly a Schema

const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = UserModel;