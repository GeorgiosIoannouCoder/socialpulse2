const express = require("express");
const router = express.Router();
const PostModel = require("../models/PostModel");
const {
  newReportPostSurferNotification,
} = require("../utilsServer/notificationActions");
const uuid = require("uuid").v4;

router.get("/", async (req, res) => {
  try {
    const mostLikedPosts = await PostModel.find()
      .sort({ likesCount: -1 })
      .limit(3)
      .populate("user")
      .populate("comments.user");

    if (mostLikedPosts.length === 0) {
      return res.json([]);
    }

    // Update post type to "Trendy" based on conditions
    for (const post of mostLikedPosts) {
      const shouldUpdateType =
        post.reads.length > 10 && post.likesCount - post.dislikesCount > 3;

      if (shouldUpdateType && post.kind !== "Trendy") {
        await PostModel.findByIdAndUpdate(post._id, { kind: "Trendy" });
      }
    }

    return res.json(mostLikedPosts);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.post("/report/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const { text, postOwnerUserId } = req.body;

    if (text.length < 1)
      return res.status(401).send("Report should be at least one character!");

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).send("Post not found!");
    }

    const newReport = {
      _id: uuid(),
      text,
      user: null,
      date: Date.now(),
    };

    await post.reports.unshift(newReport);
    await PostModel.findByIdAndUpdate(postId, { $inc: { reportsCount: 1 } });
    await post.save();

    await newReportPostSurferNotification(
      postId,
      newReport._id,
      post.user.toString(),
      text
    );

    return res.status(200).json(newReport._id);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

module.exports = router;
