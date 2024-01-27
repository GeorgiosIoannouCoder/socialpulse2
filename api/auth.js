const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const FollowerModel = require("../models/FollowerModel");
const PostModel = require("../models/PostModel");
const ChatModel = require("../models/ChatModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const isEmail = require("validator/lib/isEmail");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  const { userId } = req;

  try {
    const user = await UserModel.findById(userId);

    const userFollowStats = await FollowerModel.findOne({ user: userId });

    return res.status(200).json({ user, userFollowStats });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error!");
  }
});

router.post("/", async (req, res) => {
  const { email, password } = req.body.user;

  if (!isEmail(email)) {
    return res.status(401).send("Invalid Email!");
  }

  if (password.length < 4) {
    return res.status(401).send("Password must be at least four characters!");
  }

  try {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).send("Invalid Credentials!");
    }

    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(401).send("Invalid Credentials!");
    }

    // Check if user meets promotion conditions to become a Trendy user.

    // Retrieve the count of followers from FollowerModel.
    const followerModel = await FollowerModel.findOne({ user: user._id });
    const followerCount =
      (followerModel && followerModel.followers.length) || 0;

    // Retrieve tips.
    const tipAmount = user.tips || 0;

    // Iterate over the user's posts and count likes
    let totalLikes = 0;

    const userPosts = await PostModel.find({ user: user._id });

    for (const post of userPosts) {
      totalLikes += post.likes.length;
    }

    // Retrieve the count of the user's Trendy posts.
    const trendyPostCount = await PostModel.countDocuments({
      user: user._id,
      kind: "Trendy",
    });

    if (
      followerCount > 10 &&
      tipAmount > 100 &&
      totalLikes > 10 &&
      trendyPostCount >= 2 &&
      user.role !== "Trendy"
    ) {
      // Update user role to "Trendy"
      await UserModel.findByIdAndUpdate(user._id, { role: "Trendy" });
    }

    const chatModel = await ChatModel.findOne({
      user: user._id,
    });

    if (!chatModel) {
      await new ChatModel({ user: user._id, chats: [] }).save();
    }

    const payload = { userId: user._id };
    jwt.sign(
      payload,
      process.env.jwtSecret,
      { expiresIn: "2d" },
      (err, token) => {
        if (err) {
          throw err;
        }
        res.status(200).json(token);
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error!");
  }
});

module.exports = router;
