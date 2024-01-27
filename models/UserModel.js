const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    username: { type: String, required: true, unique: true, trim: true },
    profilePicUrl: { type: String },
    newMessagePopup: { type: Boolean, default: true },
    unreadMessage: { type: Boolean, default: false },
    unreadNotification: { type: Boolean, default: false },
    role: {
      type: String,
      default: "Ordinary",
      enum: ["Ordinary", "Corporate", "Trendy", "Super"],
    },
    warningsCount: { type: Number, default: 0 },
    accountBalance: { type: Number, default: 10, min: 0 },
    tips: { type: Number, default: 0 },
    resetToken: { type: String },
    expireToken: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
