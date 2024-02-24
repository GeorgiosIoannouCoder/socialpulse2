const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
    location: { type: String },
    company: { type: String },
    language: { type: String },
    type: {
      type: String,
      default: "Regular",
      enum: ["Regular", "Ad", "Job"],
    },
    kind: {
      type: String,
      default: "Ordinary",
      enum: ["Ordinary", "Trendy"],
    },
    keywords: [{ type: String, required: true }],
    picUrl: { type: String },
    likes: [{ user: { type: Schema.Types.ObjectId, ref: "User" } }],
    likesCount: { type: Number, default: 0 }, // For displaying most liked posts.
    dislikes: [{ user: { type: Schema.Types.ObjectId, ref: "User" } }],
    dislikesCount: { type: Number, default: 0 }, // For displaying most disliked posts.
    comments: [
      {
        _id: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    reports: [
      {
        _id: { type: String, required: true },
        user: { type: Schema.Types.ObjectId, ref: "User", default: null },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    reportsCount: { type: Number, default: 0 },
    reads: [{ user: { type: Schema.Types.ObjectId, ref: "User" } }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
