const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const baseUrl = require("../utils/baseUrl");
const isEmail = require("validator/lib/isEmail");
const options = {
  auth: {
    api_key: process.env.sendGrid_api,
  },
};

const transporter = nodemailer.createTransport(sendGridTransport(options));

// Send the reset password email.
router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!isEmail(email)) {
      return res.status(401).send("Invalid Email!");
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).send("User not found!");
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.expireToken = Date.now() + 600000;

    await user.save();

    const href = `${baseUrl}/reset/${token}`;

    const mailOptions = {
      to: user.email,
      from: "gioanno000@citymail.cuny.edu",
      subject: "Password reset request for SocialPulse2 account!",
      html: `<p>Hey ${user.name
        .split(" ")[0]
        .toString()}, There was a request for password reset for your SocialPulse2 account!. <a href=${href}>Click this link to reset the password </a>   </p>
      <p>This token is only valid for 10 minutes. If this email is not relevant to you please disregard it.</p></br><p>Thank you very much!</p>`,
    };

    transporter.sendMail(mailOptions, (err, info) => err && console.log(err));

    return res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

// Verify the token and reset the password.
router.post("/token", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(401).send("Unauthorized!");
    }

    // if (password.length < 6)
    //   return res.status(401).send("Password must be at least 6 characters!");

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/;

    if (!passwordRegex.test(password)) {
      if (password.length < 4) {
        let errorMessage = "Password must be at minimum four characters!";
        return res.status(401).send(errorMessage);
      }

      if (!/(?=.*[a-z])/.test(password)) {
        let errorMessage =
          "Password must contain at least one lowercase letter!";
        return res.status(401).send(errorMessage);
      }

      if (!/(?=.*[A-Z])/.test(password)) {
        let errorMessage =
          "Password must contain at least one uppercase letter!";
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

    const user = await UserModel.findOne({ resetToken: token });

    if (!user) {
      return res.status(404).send("User not found!");
    }

    if (Date.now() > user.expireToken) {
      return res.status(401).send("Token expired. Generate new token!");
    }

    user.password = await bcrypt.hash(password, 10);

    user.resetToken = "";
    user.expireToken = undefined;

    await user.save();

    return res.status(200).send("Password updated successfully!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

module.exports = router;
