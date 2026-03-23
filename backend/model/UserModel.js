const mongoose = require("mongoose");
const UserSchema = require("../schemas/UserSchema");

// ✅ Reuse the model if it already exists, otherwise create it
const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = UserModel;