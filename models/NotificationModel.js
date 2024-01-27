const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  notifications: [
    {
      type: {
        type: String,
        enum: [
          "newRead",
          "newLike",
          "newDisLike",
          "newComment",
          "newFollower",
          "newReportPost",
          "newReportPostSurfer",
          "newReportProfile",
          "newSuperUserReport",
          "newDeposit",
          "newWithdraw",
          "newTip",
        ],
      },
      user: { type: Schema.Types.ObjectId, ref: "User", default: null },
      superUser: { type: Schema.Types.ObjectId, ref: "User" },
      post: { type: Schema.Types.ObjectId, ref: "Post" },
      profile: { type: Schema.Types.ObjectId, ref: "Profile" },
      commentId: { type: String },
      reportId: { type: String },
      text: { type: String },
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Notification", NotificationSchema);
