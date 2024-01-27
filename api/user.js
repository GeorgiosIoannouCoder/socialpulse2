const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const UserModel = require("../models/UserModel");
const ChatModel = require("../models/ChatModel");
const FollowerModel = require("../models/FollowerModel");
const NotificationModel = require("../models/NotificationModel");
const PostModel = require("../models/PostModel");
const ProfileModel = require("../models/ProfileModel");
const {
  newReportUserNotification,
  removeReportUserNotification,
  resetReportUserNotification,
  newDepositNotification,
  newWithdrawNotification,
} = require("../utilsServer/notificationActions");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const newPassword = "Becareful1!";

router.post("/report/:userToReportId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { userToReportId } = req.params;

    const user = await UserModel.findById(userId);
    const userToReport = await UserModel.findById(userToReportId);

    if (!user || !userToReport) {
      return res.status(404).send("User not found!");
    }

    await UserModel.findByIdAndUpdate(userToReportId, {
      $inc: { warningsCount: 1 },
    });
    await userToReport.save();

    if (
      userToReport.warningsCount >= 2 &&
      (userToReport.role === "Ordinary" || userToReport.role === "Corporate")
    ) {
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      await UserModel.findOneAndUpdate(
        { _id: userToReportId },
        { password: hashedPassword, warningsCount: 0 },
        { new: true }
      );
    } else if (
      userToReport.warningsCount >= 2 &&
      userToReport.role === "Trendy"
    ) {
      await UserModel.findOneAndUpdate(
        { _id: userToReportId },
        { role: "Ordinary", warningsCount: 0 },
        { new: true }
      );
    }

    await newReportUserNotification(userId, userToReportId);

    return res.status(200).send("User Reported By Super User Successfully!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.put("/unreport/:userToUnreportId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { userToUnreportId } = req.params;

    const user = await UserModel.findById(userId);
    const userToReport = await UserModel.findById(userToUnreportId);

    if (!user || !userToReport) {
      return res.status(404).send("User not found!");
    }

    if (userToReport.warningsCount === 0) {
      return res.status(404).send("Warnings Cannot Be Negative!");
    }

    await UserModel.findByIdAndUpdate(userToUnreportId, {
      $inc: { warningsCount: -1 },
    });
    await userToReport.save();

    await removeReportUserNotification(userId, userToUnreportId);

    return res.status(200).send("User Unreported By Super User Successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error!");
  }
});

router.put(
  "/reportreset/:userToUnreportId",
  authMiddleware,
  async (req, res) => {
    try {
      const { userId } = req;
      const { userToUnreportId } = req.params;

      const user = await UserModel.findById(userId);
      const userToReport = await UserModel.findById(userToUnreportId);

      if (!user || !userToReport) {
        return res.status(404).send("User not found!");
      }

      if (userToReport.warningsCount > 0) {
        await UserModel.findByIdAndUpdate(userToUnreportId, {
          warningsCount: 0,
        });
        await userToReport.save();
      }

      await resetReportUserNotification(userId, userToUnreportId);

      return res
        .status(200)
        .send("User Unreported By Super User Successfully!");
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error!");
    }
  }
);

router.delete("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send("User not found!");
    }

    await ChatModel.deleteMany({ user: userId });
    await ChatModel.updateMany(
      {},
      { $pull: { chats: { messagesWith: mongoose.Types.ObjectId(userId) } } }
    );

    await FollowerModel.deleteMany({ user: userId });
    await FollowerModel.updateMany(
      {},
      { $pull: { followers: { user: mongoose.Types.ObjectId(userId) } } }
    );
    await FollowerModel.updateMany(
      {},
      { $pull: { following: { user: mongoose.Types.ObjectId(userId) } } }
    );

    await NotificationModel.deleteMany({ user: userId });
    await NotificationModel.updateMany(
      {},
      { $pull: { notifications: { user: mongoose.Types.ObjectId(userId) } } }
    );

    await PostModel.deleteMany({ user: userId });
    await PostModel.updateMany(
      {},
      { $pull: { likes: { user: mongoose.Types.ObjectId(userId) } } }
    );
    await PostModel.updateMany(
      {},
      { $pull: { dislikes: { user: mongoose.Types.ObjectId(userId) } } }
    );
    await PostModel.updateMany(
      {},
      { $pull: { comments: { user: mongoose.Types.ObjectId(userId) } } }
    );
    await PostModel.updateMany(
      {},
      { $pull: { reports: { user: mongoose.Types.ObjectId(userId) } } }
    );
    await PostModel.updateMany(
      {},
      { $pull: { reads: { user: mongoose.Types.ObjectId(userId) } } }
    );

    await ProfileModel.deleteMany({ user: userId });
    await ProfileModel.updateMany(
      {},
      { $pull: { reports: { user: mongoose.Types.ObjectId(userId) } } }
    );

    await user.remove();
    return res.status(200).send("User deleted Successfully!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.post("/deposit/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { inputAmount } = req.body;

    const user = await UserModel.findOne({ _id: userId });

    if (!user) {
      return res.status(404).send("User not found!");
    }

    user.accountBalance += Number(inputAmount);

    await user.save();

    await newDepositNotification(userId);

    return res.status(200).send("Deposit Successful! Account Balance Updated!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.put("/withdraw/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { inputAmount } = req.body;

    const user = await UserModel.findOne({ _id: userId });

    if (!user) {
      return res.status(404).send("User not found!");
    }
    const requestedWithdrawal = Number(inputAmount);

    if (user.accountBalance < requestedWithdrawal) {
      // If the requested withdrawal is greater than the accountBalance,
      // deduct the remaining amount from the tips.
      const remainingWithdrawal = requestedWithdrawal - user.accountBalance;
      if (user.tips < remainingWithdrawal) {
        return res.status(400).send("Insufficient Funds for Withdrawal!");
      }

      user.tips -= remainingWithdrawal;
      user.accountBalance = 0;
    } else {
      // If the requested withdrawal is within the accountBalance,
      // deduct the amount directly from the accountBalance.
      user.accountBalance -= requestedWithdrawal;
    }

    await user.save();

    await newWithdrawNotification(userId);

    return res
      .status(200)
      .send("Withdraw Successful! Account Balance Updated!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

module.exports = router;
