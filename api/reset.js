const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const bcrypt = require("bcrypt");
// const nodemailer = require("nodemailer");
// const sendGridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const baseUrl = require("../utils/baseUrl");
const isEmail = require("validator/lib/isEmail");
const options = {
  auth: {
    api_key: process.env.sendGrid_api,
  },
};

// const transporter = nodemailer.createTransport(sendGridTransport(options));
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.sendGrid_api);

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

    var timestamp = new Date().getTime();
    var createdTime = new Date(timestamp);

    const currentYear = new Date().getFullYear();

    user.resetToken = token;
    user.expireToken = timestamp + 600000;

    await user.save();

    const href = `${baseUrl}/reset/${token}`;

    const mailOptions = {
      to: user.email,
      from: "gioanno000@citymail.cuny.edu",
      subject: "Password reset request for SocialPulse2 account!",
      html: `
      <div style="text-align:center;">
    <img src="https://res.cloudinary.com/dgnigx1ez/image/upload/v1671041660/socialpulse.png" alt="SocialPulse2 logo" width="200" height="200">
  </div>
  <h1 style="color:#1e3465;text-align:center;">You Reset Password Link for SocialPulse2</h1>
  <h2 style="color:#282c34;text-align:left;">This email is intended for the user with name: <span style="color:#f3682f;">${user.name
    .split(" ")[0]
    .toString()}</span> and email address: <span style="color:#f3682f;">${
        user.email
      }</span> registered at SocialPulse2.</h2>
  <div style="padding: 1px; background-color: #f1f1f1; width: 50%; margin-left: auto; margin-right: auto; text-align: center;">
    <a href="${href}" style="color:#282c34;">Change Password</a>
  </div>
  <h3 style="color:#13a2da;text-align:center;">Reset link created at: ${createdTime}</h3>
  <h3 style="color:#13a2da;text-align:center;">Reset link expires at: ${
    user.expireToken
  }</h3>
  <h2 style="color:#ff0000;text-align:left;size=5rem;">You received this email because someone requested to reset the password associated with this email account at SocialPulse2! If this was not you, please change your password!</h2>
  <h4 style="color:#1c1f25;text-align:center;">Thank you very much for choosing SocialPulse2!</h4>
  <h4 style="color:#1c1f25;text-align:center;">© ${currentYear}, SocialPulse2, Inc. or its affiliates. All rights reserved.</h4>
      `,
    };

    // transporter.sendMail(mailOptions, (err, info) => err && console.log(err));

    sgMail
      .send(mailOptions)
      .then(() => {
        console.log("Email sent successfully!");
      })
      .catch((error) => {
        console.error(error);
      });

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
