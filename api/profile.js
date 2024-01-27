const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const UserModel = require("../models/UserModel");
const PostModel = require("../models/PostModel");
const FollowerModel = require("../models/FollowerModel");
const ProfileModel = require("../models/ProfileModel");
const bcrypt = require("bcrypt");
const {
  newFollowerNotification,
  removeFollowerNotification,
  newReportProfileNotification,
} = require("../utilsServer/notificationActions");
const uuid = require("uuid").v4;

router.get("/:username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await UserModel.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).send("No User Found!");
    }

    const profile = await ProfileModel.findOne({ user: user._id }).populate(
      "user"
    );

    const profileFollowStats = await FollowerModel.findOne({ user: user._id });

    const userPosts = await PostModel.find({ user: user._id });

    const totalReportsCount = userPosts.reduce(
      (total, post) => total + post.reportsCount,
      0
    );

    return res.json({
      profile,

      followersLength:
        profileFollowStats.followers.length > 0
          ? profileFollowStats.followers.length
          : 0,

      followingLength:
        profileFollowStats.following.length > 0
          ? profileFollowStats.following.length
          : 0,

      reportPostsLength: totalReportsCount > 0 ? totalReportsCount : 0,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.get("/id/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).send("No User Found!");
    }
    return res.json({
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.get("/trendy/:username", authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await UserModel.findOne({ username: username.toLowerCase() });

    if (!user) {
      return res.status(404).send("No User Found!");
    }
    const authenticatedUserId = user._id;

    const allTrendyProfiles = await UserModel.find({
      role: "Trendy",
      _id: { $ne: authenticatedUserId }, // Exclude the authenticated user.
    });

    // Shuffle the trendy profiles array using Fisher-Yates algorithm.
    const shuffledTrendyProfiles = [...allTrendyProfiles];

    for (let i = shuffledTrendyProfiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledTrendyProfiles[i], shuffledTrendyProfiles[j]] = [
        shuffledTrendyProfiles[j],
        shuffledTrendyProfiles[i],
      ];
    }

    // Select the first 3 profiles from the shuffled array.
    const trendyProfiles = shuffledTrendyProfiles.slice(0, 3);

    const currentUserFollowing = await FollowerModel.findOne({
      user: user._id,
    }).populate("following");
    const followingIds = currentUserFollowing.following.map((user) => user._id);
    const profilesToReturn = await Promise.all(
      trendyProfiles.map(async (trendyUser) => {
        return { user: trendyUser, currentUserFollowing };
      })
    );

    return res.json({ trendyProfiles: profilesToReturn });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.get("/id/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).send("No User Found!");
    }
    return res.json({
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});
router.get(`/posts/:username`, authMiddleware, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await UserModel.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(404).send("No User Found!");
    }

    const posts = await PostModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user")
      .populate("comments.user");

    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.get("/followers/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await FollowerModel.findOne({ user: userId }).populate(
      "followers.user"
    );

    return res.json(user.followers);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.get("/following/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await FollowerModel.findOne({ user: userId }).populate(
      "following.user"
    );

    return res.json(user.following);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.post("/follow/:userToFollowId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { userToFollowId } = req.params;

    const user = await FollowerModel.findOne({ user: userId });
    const userToFollow = await FollowerModel.findOne({ user: userToFollowId });

    if (!user || !userToFollow) {
      return res.status(404).send("User not found!");
    }

    const isFollowing =
      user.following.length > 0 &&
      user.following.filter(
        (following) => following.user.toString() === userToFollowId
      ).length > 0;

    if (isFollowing) {
      return res.status(401).send("User Already Followed!");
    }

    await user.following.unshift({ user: userToFollowId });
    await user.save();

    await userToFollow.followers.unshift({ user: userId });
    await userToFollow.save();

    await newFollowerNotification(userId, userToFollowId);

    return res.status(200).send("Updated!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.put("/unfollow/:userToUnfollowId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { userToUnfollowId } = req.params;

    const user = await FollowerModel.findOne({
      user: userId,
    });

    const userToUnfollow = await FollowerModel.findOne({
      user: userToUnfollowId,
    });

    if (!user || !userToUnfollow) {
      return res.status(404).send("User not found!");
    }

    const isFollowing =
      user.following.length > 0 &&
      user.following.filter(
        (following) => following.user.toString() === userToUnfollowId
      ).length === 0;

    if (isFollowing) {
      return res.status(401).send("User Not Followed before!");
    }

    const removeFollowing = await user.following
      .map((following) => following.user.toString())
      .indexOf(userToUnfollowId);

    await user.following.splice(removeFollowing, 1);
    await user.save();

    const removeFollower = await userToUnfollow.followers
      .map((follower) => follower.user.toString())
      .indexOf(userId);

    await userToUnfollow.followers.splice(removeFollower, 1);
    await userToUnfollow.save();

    await removeFollowerNotification(userId, userToUnfollowId);

    return res.status(200).send("Updated!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error!");
  }
});

router.post("/update", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;

    const {
      bio,
      facebook,
      instagram,
      twitter,
      linkedin,
      github,
      youtube,
      profilePicUrl,
    } = req.body;

    let profileFields = {};
    profileFields.user = userId;

    profileFields.bio = bio;

    profileFields.social = {};

    if (facebook) profileFields.social.facebook = facebook;

    if (instagram) profileFields.social.instagram = instagram;

    if (twitter) profileFields.social.twitter = twitter;

    if (linkedin) profileFields.social.linkedin = linkedin;

    if (github) profileFields.social.github = github;

    if (youtube) profileFields.social.youtube = youtube;

    await ProfileModel.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      { new: true }
    );

    if (profilePicUrl) {
      const user = await UserModel.findById(userId);
      user.profilePicUrl = profilePicUrl;
      await user.save();
    }

    return res.status(200).send("Success!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.post("/settings/password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (newPassword.length < 6) {
      return res.status(400).send("Password must be atleast 6 characters!");
    }

    const user = await UserModel.findById(req.userId).select("+password");

    const isPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isPassword) {
      return res.status(401).send("Invalid Current Password!");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).send("Updated successfully!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.post("/settings/messagePopup", authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (user.newMessagePopup) {
      user.newMessagePopup = false;
    } else {
      user.newMessagePopup = true;
    }

    await user.save();
    return res.status(200).send("Updated Successfully!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.post("/report/:profileId", authMiddleware, async (req, res) => {
  try {
    const { profileId } = req.params;
    const { userId } = req;
    const { text, profileOwnerUserId } = req.body;

    if (profileOwnerUserId === userId) {
      return res.status(401).send("Cannot Report Your Profile!");
    }

    if (text.length < 1)
      return res.status(401).send("Report should be at least one character!");

    const profile = await ProfileModel.findById(profileId);

    if (!profile) {
      return res.status(404).send("Profile not found!");
    }

    const newReport = {
      _id: uuid(),
      text,
      user: userId,
      date: Date.now(),
    };

    await profile.reports.unshift(newReport);
    await ProfileModel.findByIdAndUpdate(profileId, {
      $inc: { reportsCount: 1 },
    });
    await profile.save();

    if (profile.user.toString() !== userId) {
      await newReportProfileNotification(
        profileId,
        newReport._id,
        userId,
        profile.user.toString(),
        text
      );
    }

    return res.status(200).json(newReport._id);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

module.exports = router;
