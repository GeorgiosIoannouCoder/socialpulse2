const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const ProfileModel = require("../models/ProfileModel");
const FollowerModel = require("../models/FollowerModel");
const NotificationModel = require("../models/NotificationModel");
const ChatModel = require("../models/ChatModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const isEmail = require("validator/lib/isEmail");
const userPng =
  "https://res.cloudinary.com/" +
  String(process.env.CLOUDINARY_CLOUD_NAME) +
  "/image/upload/v1671041660/socialpulse.png";

// ^[A-Za-z0-9]: Ensures that the username starts with an alphanumeric character.
//(?:[A-Za-z0-9-]{0,28}[A-Za-z0-9])?$: Allows alphanumeric characters or hyphens
// in the middle of the username and ensures that the username ends with an alphanumeric character.
// The total length of the username should be between 1 and 30 characters.
const regexUserName =
  /^(?!.*\.\.)(?!.*\.$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,28}[A-Za-z0-9])?$/;

router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    if (username.length < 1)
      return res
        .status(401)
        .send("Username should be between 1 and 30 characters!");

    if (username.length > 30)
      return res
        .status(401)
        .send("Username should be between 1 and 30 characters!");

    if (!regexUserName.test(username)) {
      return res.status(401).send("Invalid Username!");
    }

    if (username === "noprofilefound")
      return res.status(401).send("Invalid Username!");

    const user = await UserModel.findOne({ username: username.toLowerCase() });

    if (user) {
      return res.status(401).send("Username already taken!");
    }

    return res.status(200).send("Available");
  } catch (error) {
    return res.status(500).send("Server error!");
  }
});

router.post("/", async (req, res) => {
  const {
    name,
    email,
    username,
    password,
    bio,
    facebook,
    instagram,
    twitter,
    linkedin,
    github,
    youtube,
  } = req.body.user;

  const role = req.body.role;

  if (!isEmail(email)) return res.status(401).send("Invalid Email!");

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/;

  if (!passwordRegex.test(password)) {
    if (password.length < 4) {
      let errorMessage = "Password must be at minimum four characters!";
      return res.status(401).send(errorMessage);
    }

    if (!/(?=.*[a-z])/.test(password)) {
      let errorMessage = "Password must contain at least one lowercase letter!";
      return res.status(401).send(errorMessage);
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      let errorMessage = "Password must contain at least one uppercase letter!";
      return res.status(401).send(errorMessage);
    }

    if (!/(?=.*\d)/.test(password)) {
      let errorMessage = "Password must contain at least one number!";
      return res.status(401).send(errorMessage);
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      let errorMessage =
        "Password must contain at least one special character!";
      return res.status(401).send(errorMessage);
    }
  }

  try {
    let user;
    user = await UserModel.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(401).send("Email already registered!");
    }

    user = new UserModel({
      name,
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
      role: role,
      profilePicUrl: req.body.profilePicUrl || userPng,
    });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    let profileFields = {};
    profileFields.user = user._id;

    profileFields.bio = bio;

    profileFields.social = {};

    if (facebook) {
      profileFields.social.facebook = facebook;
    }

    if (instagram) {
      profileFields.social.instagram = instagram;
    }

    if (twitter) {
      profileFields.social.twitter = twitter;
    }

    if (linkedin) {
      profileFields.social.linkedin = linkedin;
    }

    if (github) {
      profileFields.social.github = github;
    }

    if (youtube) {
      profileFields.social.youtube = youtube;
    }

    await new ProfileModel(profileFields).save();
    await new FollowerModel({
      user: user._id,
      followers: [],
      following: [],
    }).save();
    await new NotificationModel({ user: user._id, notifications: [] }).save();
    await new ChatModel({ user: user._id, chats: [] }).save();

    const payload = { userId: user._id };
    jwt.sign(
      payload,
      process.env.jwtSecret,
      { expiresIn: "2d" },
      (err, token) => {
        if (err) throw err;
        res.status(200).json(token);
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server error!");
  }
});

module.exports = router;
