const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const PostModel = require("../models/PostModel");
const UserModel = require("../models/UserModel");

router.get(
  "/:username/:likesCount/:dislikesCount/:keywords",
  authMiddleware,
  async (req, res) => {
    try {
      const { username, likesCount, dislikesCount, keywords } = req.params;
      const searchCriteria = {};
      if (username !== "null") {
        const user = await UserModel.findOne({ username });

        if (user) {
          // Use the found user's _id to search for posts
          searchCriteria["user"] = user;
        } else {
          const users = await UserModel.find({ username: { $gte: username } });

          if (users.length > 0) {
            // Use the found users' _id to search for posts
            searchCriteria["user"] = { $in: users.map((user) => user._id) };
          } else {
            // If users not found, return an empty array
            return res.status(200).json([]);
          }
        }
      }

      // Get keywords
      if (keywords !== "null") {
        searchCriteria["keywords"] = keywords;
      }

      // Find posts based on number of likes
      if (likesCount !== "null") {
        searchCriteria["likesCount"] = parseInt(likesCount);
      }

      // Find posts based on number of dislikes
      if (dislikesCount !== "null") {
        searchCriteria["dislikesCount"] = parseInt(dislikesCount);
      }
      const results = await PostModel.find(searchCriteria).sort({
        createdAt: -1,
      });

      let resultsIds = results.map((result) => result.user);

      let resultsUsers = [];

      for (let resultsId of resultsIds) {
        let userId = String(resultsId);
        const user = await UserModel.findById(userId);
        resultsUsers.push(user);
      }

      return res.status(200).json({ results, resultsUsers });
    } catch (error) {
      console.error(error);
      return res.status(500).send("Server error!");
    }
  }
);

module.exports = router;
