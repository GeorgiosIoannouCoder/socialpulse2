const UserModel = require("../models/UserModel");
const NotificationModel = require("../models/NotificationModel");

const setNotificationToUnread = async (userId) => {
  try {
    const user = await UserModel.findById(userId);

    if (!user.unreadNotification) {
      user.unreadNotification = true;
      await user.save();
    }

    return;
  } catch (error) {
    console.error(error);
  }
};

const newLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    });
    const newNotification = {
      type: "newLike",
      user: userId,
      post: postId,
      date: Date.now(),
    };

    await userToNotify.notifications.unshift(newNotification);
    await userToNotify.save();
    await setNotificationToUnread(userToNotifyId);

    return;
  } catch (error) {
    console.error(error);
  }
};

const removeLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId });
    const notificationToRemove = await user.notifications.find(
      (notification) =>
        notification.type === "newLike" &&
        notification.user.toString() === userId &&
        notification.post.toString() === postId
    );
    const indexOf = user.notifications
      .map((notification) => notification._id.toString())
      .indexOf(notificationToRemove._id.toString());

    await user.notifications.splice(indexOf, 1);
    await user.save();

    return;
  } catch (error) {
    console.error(error);
  }
};
const newDisLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    });
    const newNotification = {
      type: "newDisLike",
      user: userId,
      post: postId,
      date: Date.now(),
    };

    await userToNotify.notifications.unshift(newNotification);
    await userToNotify.save();
    await setNotificationToUnread(userToNotifyId);

    return;
  } catch (error) {
    console.error(error);
  }
};
const removeDisLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId });
    const notificationToRemove = await user.notifications.find(
      (notification) =>
        notification.type === "newDisLike" &&
        notification.user.toString() === userId &&
        notification.post.toString() === postId
    );
    const indexOf = user.notifications
      .map((notification) => notification._id.toString())
      .indexOf(notificationToRemove._id.toString());

    await user.notifications.splice(indexOf, 1);
    await user.save();

    return;
  } catch (error) {
    console.error(error);
  }
};

const newCommentNotification = async (
  postId,
  commentId,
  userId,
  userToNotifyId,
  text
) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    });
    const newNotification = {
      type: "newComment",
      user: userId,
      post: postId,
      commentId,
      text,
      date: Date.now(),
    };

    await userToNotify.notifications.unshift(newNotification);
    await userToNotify.save();
    await setNotificationToUnread(userToNotifyId);
    return;
  } catch (error) {
    console.error(error);
  }
};

const removeCommentNotification = async (
  postId,
  commentId,
  userId,
  userToNotifyId
) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId });
    const notificationToRemove = await user.notifications.find(
      (notification) =>
        notification.type === "newComment" &&
        notification.user.toString() === userId &&
        notification.post.toString() === postId &&
        notification.commentId === commentId
    );
    const indexOf = await user.notifications
      .map((notification) => notification._id.toString())
      .indexOf(notificationToRemove._id.toString());

    await user.notifications.splice(indexOf, 1);
    await user.save();
  } catch (error) {
    console.error(error);
  }
};

const newReportProfileNotification = async (
  profileId,
  reportId,
  userId,
  userToNotifyId,
  text
) => {
  try {
    const superUsers = await UserModel.find({ role: "Super" });
    const randomIndex = Math.floor(Math.random() * superUsers.length);
    const randomSuperUser = superUsers[randomIndex];
    const superUserToNotifyId = randomSuperUser._id;

    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    });
    const newNotification = {
      type: "newReportProfile",
      user: userId,
      profile: profileId,
      reportId,
      text,
      date: Date.now(),
      superUser: superUserToNotifyId,
    };

    await userToNotify.notifications.unshift(newNotification);
    await userToNotify.save();
    await setNotificationToUnread(userToNotifyId);

    const superUserToNotify = await NotificationModel.findOne({
      user: superUserToNotifyId,
    });
    const newSuperUserNotification = {
      type: "newReportProfile",
      user: userId,
      profile: profileId,
      reportId,
      text,
      date: Date.now(),
      superUser: superUserToNotifyId,
    };

    await superUserToNotify.notifications.unshift(newSuperUserNotification);
    await superUserToNotify.save();
    await setNotificationToUnread(superUserToNotifyId);

    return;
  } catch (error) {
    console.error(error);
  }
};

const newReportPostNotification = async (
  postId,
  reportId,
  userId,
  userToNotifyId,
  text
) => {
  try {
    const superUsers = await UserModel.find({ role: "Super" });
    const randomIndex = Math.floor(Math.random() * superUsers.length);
    const randomSuperUser = superUsers[randomIndex];
    const superUserToNotifyId = randomSuperUser._id;

    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    });
    const newNotification = {
      type: "newReportPost",
      user: userId,
      post: postId,
      reportId,
      text,
      date: Date.now(),
      superUser: superUserToNotifyId,
    };

    await userToNotify.notifications.unshift(newNotification);
    await userToNotify.save();
    await setNotificationToUnread(userToNotifyId);

    const superUserToNotify = await NotificationModel.findOne({
      user: superUserToNotifyId,
    });
    const newSuperUserNotification = {
      type: "newReportPost",
      user: userId,
      post: postId,
      reportId,
      text,
      date: Date.now(),
      superUser: superUserToNotifyId,
    };

    await superUserToNotify.notifications.unshift(newSuperUserNotification);
    await superUserToNotify.save();
    await setNotificationToUnread(superUserToNotifyId);

    return;
  } catch (error) {
    console.error(error);
  }
};

const newFollowerNotification = async (userId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId });
    const newNotification = {
      type: "newFollower",
      user: userId,
      date: Date.now(),
    };

    await user.notifications.unshift(newNotification);
    await user.save();
    await setNotificationToUnread(userToNotifyId);

    return;
  } catch (error) {
    console.error(error);
  }
};

const removeFollowerNotification = async (userId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId });
    const notificationToRemove = await user.notifications.find(
      (notification) =>
        notification.type === "newFollower" &&
        notification.user.toString() === userId
    );
    const indexOf = await user.notifications
      .map((notification) => notification._id.toString())
      .indexOf(notificationToRemove._id.toString());

    await user.notifications.splice(indexOf, 1);
    await user.save();
  } catch (error) {
    console.error(error);
  }
};

const newReportUserNotification = async (userId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId });
    const newNotification = {
      type: "newSuperUserReport",
      user: userId,
      date: Date.now(),
    };

    await user.notifications.unshift(newNotification);
    await user.save();
    await setNotificationToUnread(userToNotifyId);

    return;
  } catch (error) {
    console.error(error);
  }
};

const removeReportUserNotification = async (userId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId });
    const notificationToRemove = await user.notifications.find(
      (notification) =>
        notification.type === "newSuperUserReport" &&
        notification.user.toString() === userId
    );

    if (!notificationToRemove) {
      console.error(`Notification not found for user: ${userId}`);
      return;
    }

    const indexOf = await user.notifications
      .map((notification) => notification._id.toString())
      .indexOf(notificationToRemove._id.toString());

    await user.notifications.splice(indexOf, 1);
    await user.save();
  } catch (error) {
    console.error(error);
  }
};

const resetReportUserNotification = async (userId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId });

    if (!user) {
      console.error(`User not found for id: ${userToNotifyId}`);
      return;
    }

    user.notifications = user.notifications.filter(
      (notification) => notification.type !== "newSuperUserReport"
    );

    await user.save();
  } catch (error) {
    console.error(error);
  }
};

const newReadNotification = async (userId, postId, userToNotifyId) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    });
    const newNotification = {
      type: "newRead",
      user: userId,
      post: postId,
      date: Date.now(),
    };

    await userToNotify.notifications.unshift(newNotification);
    await userToNotify.save();
    await setNotificationToUnread(userToNotifyId);

    return;
  } catch (error) {
    console.error(error);
  }
};

const newReportPostSurferNotification = async (
  postId,
  reportId,
  userToNotifyId,
  text
) => {
  try {
    const superUsers = await UserModel.find({ role: "Super" });
    const randomIndex = Math.floor(Math.random() * superUsers.length);
    const randomSuperUser = superUsers[randomIndex];
    const superUserToNotifyId = randomSuperUser._id;

    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    });
    const newNotification = {
      type: "newReportPostSurfer",
      user: null,
      post: postId,
      reportId,
      text,
      date: Date.now(),
      superUser: superUserToNotifyId,
    };

    await userToNotify.notifications.unshift(newNotification);
    await userToNotify.save();
    await setNotificationToUnread(userToNotifyId);

    const superUserToNotify = await NotificationModel.findOne({
      user: superUserToNotifyId,
    });
    const newSuperUserNotification = {
      type: "newReportPostSurfer",
      user: null,
      post: postId,
      reportId,
      text,
      date: Date.now(),
      superUser: superUserToNotifyId,
    };

    await superUserToNotify.notifications.unshift(newSuperUserNotification);
    await superUserToNotify.save();
    await setNotificationToUnread(superUserToNotifyId);

    return;
  } catch (error) {
    console.error(error);
  }
};

const newDepositNotification = async (userId) => {
  try {
    const user = await NotificationModel.findOne({ user: userId });
    const newNotification = {
      type: "newDeposit",
      user: userId,
      date: Date.now(),
    };

    await user.notifications.unshift(newNotification);
    await user.save();
    await setNotificationToUnread(userId);

    return;
  } catch (error) {
    console.error(error);
  }
};

const newWithdrawNotification = async (userId) => {
  try {
    const user = await NotificationModel.findOne({ user: userId });
    const newNotification = {
      type: "newWithdraw",
      user: userId,
      date: Date.now(),
    };

    await user.notifications.unshift(newNotification);
    await user.save();
    await setNotificationToUnread(userToNotifyId);

    return;
  } catch (error) {
    console.error(error);
  }
};

const newTipNotification = async (userId, postId, userToNotifyId) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    });
    const newNotification = {
      type: "newTip",
      user: userId,
      post: postId,
      date: Date.now(),
    };

    await userToNotify.notifications.unshift(newNotification);
    await userToNotify.save();
    await setNotificationToUnread(userToNotifyId);

    return;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  newLikeNotification,
  newDisLikeNotification,
  removeLikeNotification,
  removeDisLikeNotification,
  newCommentNotification,
  removeCommentNotification,
  newReportPostNotification,
  newReportProfileNotification,
  newFollowerNotification,
  removeFollowerNotification,
  newReportUserNotification,
  removeReportUserNotification,
  resetReportUserNotification,
  newReadNotification,
  newReportPostSurferNotification,
  newDepositNotification,
  newWithdrawNotification,
  newTipNotification,
};
