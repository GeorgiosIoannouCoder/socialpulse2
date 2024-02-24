const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const UserModel = require("../models/UserModel");
const PostModel = require("../models/PostModel");
const FollowerModel = require("../models/FollowerModel");
const uuid = require("uuid").v4;
const {
  newLikeNotification,
  newDisLikeNotification,
  removeLikeNotification,
  removeDisLikeNotification,
  newCommentNotification,
  removeCommentNotification,
  newReportPostNotification,
  newReadNotification,
  newTipNotification,
} = require("../utilsServer/notificationActions");
const tabooWords = require("../utils/tabooWords");

router.post("/", authMiddleware, async (req, res) => {
  try {
    let { text } = req.body;
    const { location, company, type, keywords, picUrl } = req.body;

    const user = await UserModel.findById(req.userId);
    const role = user.role;

    let wordCount = 0;
    const trimmedStr = text.trim();
    if (trimmedStr === "") {
      wordCount = 0;
    }
    const words = trimmedStr.split(/\s+/);
    wordCount = words.length;

    // function to count the number of taboowords in the users post
    function countTabooWords() {
      // variable to count the number of taboo words
      let count = 0;

      // variable to get all the words in the users text
      let textWords = text.split(" ");

      // iterate through all textWords
      for (let i = 0; i < textWords.length; i++) {
        if (tabooWords.includes(textWords[i])) {
          count++;
        }
      }
      return count;
    }

    function censorTabooWords() {
      // Variable to be the new text
      let newText = "";

      // Variable to get all the words in the users text
      let textWords = text.split(/\s+/); // Use regex to split by any whitespace

      // Iterate through all textWords
      for (let i = 0; i < textWords.length; i++) {
        // Remove trailing punctuation marks
        let word = textWords[i].replace(/[^\w\s]/gi, "");
        if (tabooWords.includes(word)) {
          let lenOfTabooWord = word.length;
          let stars = "";

          // Get the appropriate number of stars
          for (let j = 0; j < lenOfTabooWord; j++) {
            stars += "*";
          }
          textWords[i] = stars;
        }
      }

      newText = textWords.join(" ");

      return newText;
    }

    // Variable to store the number of taboowords the user has
    let taboowords = countTabooWords();

    // Checking the number of taboowords the user has
    if (taboowords >= 3) {
      return res.status(401).send("Post cannot have more than 3 taboo words!");
    }

    if (text.length < 1) {
      return res.status(401).send("Text must be at least one character!");
    }

    if (!keywords[keywords.length - 1]) {
      return res.status(401).send("Please select at least one keyword!");
    }

    // Replace text with the censored version
    text = censorTabooWords();

    const newPost = {
      user: req.userId,
      text,
    };

    if (location) {
      newPost.location = location;
    }

    if (company) {
      newPost.company = company;
    }

    if (type) {
      newPost.type = type;
    }

    if (keywords[keywords.length - 1]) {
      newPost.keywords = keywords[keywords.length - 1];
    }

    if (picUrl) {
      newPost.picUrl = picUrl;
    }

    if (role !== "Super") {
      // Charge 10 words per image.
      if (picUrl) {
        wordCount += Number(10);
      }

      // Charge $1 per word with a video being 15 words and an image being 10 words.
      if (role === "Corporate") {
        user.accountBalance -= Number(wordCount);
      } else {
        const baseCharge = 20; // Number of free words before applying the charge

        let chargeableWords = Math.max(0, wordCount - baseCharge);

        if (chargeableWords > 0) {
          const chargePerWord = 0.1;

          const chargeAmount = chargeableWords * chargePerWord;

          // If the user has enough accountBalance, deduct the chargeAmount
          if (user.accountBalance >= chargeAmount) {
            user.accountBalance -= chargeAmount;
          } else {
            // If not enough accountBalance, deduct the remaining from tips
            const remainingCharge = chargeAmount - user.accountBalance;
            user.accountBalance = 0;

            if (user.tips >= remainingCharge) {
              user.tips -= remainingCharge;
            } else {
              // If not enough tips, handle the situation (e.g., show an error)
              console.error("Insufficient funds for the charge!");
            }
          }
        }
      }
    }

    await user.save();

    const post = await new PostModel(newPost).save();

    const postCreated = await PostModel.findById(post._id).populate("user");

    return res.json(postCreated);
  } catch (error) {
    console.log(error);
    return res.status(404).send("Oops! Pease try again!");
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const { pageNumber } = req.query;

  const number = Number(pageNumber);
  const size = 8;

  try {
    let posts;

    if (number === 1) {
      posts = await PostModel.find()
        .limit(size)
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("comments.user");
    } else {
      const skips = size * (number - 1);
      posts = await PostModel.find()
        .skip(skips)
        .limit(size)
        .sort({ createdAt: -1 })
        .populate("user")
        .populate("comments.user");
    }

    if (posts.length === 0) {
      return res.json([]);
    }

    let postsToBeSent = [];
    const { userId } = req;

    const loggedUser = await FollowerModel.findOne({ user: userId });

    if (loggedUser.following.length === 0) {
      postsToBeSent = posts.filter(
        (post) => post.user._id.toString() === userId
      );
    } else {
      for (let i = 0; i < loggedUser.following.length; i++) {
        const foundPostsFromFollowing = posts.filter(
          (post) =>
            post.user._id.toString() === loggedUser.following[i].user.toString()
        );

        if (foundPostsFromFollowing.length > 0) {
          postsToBeSent.push(...foundPostsFromFollowing);
        }
      }

      const foundOwnPosts = posts.filter(
        (post) => post.user._id.toString() === userId
      );
      if (foundOwnPosts.length > 0) {
        postsToBeSent.push(...foundOwnPosts);
      }
    }

    // Update post type to "Trendy" based on conditions
    postsToBeSent.forEach(async (post) => {
      const shouldUpdateType =
        post.reads.length > 10 && post.likesCount - post.dislikesCount > 3;

      if (shouldUpdateType && post.kind !== "Trendy") {
        await PostModel.findByIdAndUpdate(post._id, { kind: "Trendy" });
      }
    });

    postsToBeSent.length > 0 &&
      postsToBeSent.sort((a, b) => [
        new Date(b.createdAt) - new Date(a.createdAt),
      ]);

    return res.json(postsToBeSent);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.get("/:postId", authMiddleware, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.postId)
      .populate("user")
      .populate("comments.user");

    if (!post) {
      return res.status(404).send("Post not found!");
    }

    // Update post type to "Trendy" based on conditions
    const shouldUpdateType =
      post.reads.length > 10 && post.likesCount - post.dislikesCount > 3;

    if (shouldUpdateType && post.kind !== "Trendy") {
      await PostModel.findByIdAndUpdate(req.params.postId, { kind: "Trendy" });
    }

    return res.json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.delete("/:postId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;

    const { postId } = req.params;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found!");
    }

    const user = await UserModel.findById(userId);

    if (post.user.toString() !== userId) {
      if (user.role === "Super") {
        await post.remove();
        return res.status(200).send("Post deleted Successfully!");
      } else {
        return res.status(401).send("Unauthorized!");
      }
    }

    await post.remove();
    return res.status(200).send("Post deleted Successfully!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

// Dynamic Route with postId.
// Method: POST
// Middleware: authMiddleware
router.post("/like/:postId", authMiddleware, async (req, res) => {
  try {
    // Extract postId and userId from request parameters and user information.
    const { postId } = req.params;
    const { userId } = req;

    // Find the post in the database based on postId.
    const post = await PostModel.findById(postId);

    // Check if the post exists.
    if (!post) {
      // If no post is found, return a 404 response.
      return res.status(404).send("No Post found!");
    }

    // Check if the user has already liked the post.
    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length > 0;

    // If the user has already liked the post, return a 401 response.
    if (isLiked) {
      return res.status(401).send("Post already liked!");
    }

    // Check if the user has already disliked the post.
    const isDisLiked =
      post.dislikes.filter((dislike) => dislike.user.toString() === userId)
        .length > 0;

    // If the user has already disliked the post, remove the dislike.
    if (isDisLiked) {
      post.dislikes = post.dislikes.filter(
        (dislike) => dislike.user.toString() !== userId
      );
      post.dislikesCount--;
      post.likesCount++;
      // Save the updated post without the dislike.
      await post.save();

      // Add a new like to the post.
      await post.likes.unshift({ user: userId });

      // Save the updated post with the new like.
      await post.save();

      // Check if the user liking the post is not the post owner.
      if (post.user.toString() !== userId) {
        // If true, send a new like notification to the post owner.
        await newLikeNotification(userId, postId, post.user.toString());
      }

      // Return a 200 response indicating that the post has been liked successfully.
      return res.status(200).send("Post liked!");
    }

    // If the user hasn't liked and disliked the post, add a new like to the post.
    await post.likes.unshift({ user: userId });
    post.likesCount++;

    // Save the updated post with the new like.
    await post.save();

    // Check if the user liking the post is not the post owner.
    if (post.user.toString() !== userId) {
      // If true, send a new like notification to the post owner.
      await newLikeNotification(userId, postId, post.user.toString());
    }

    // Return a 200 response indicating that the post has been liked successfully.
    return res.status(200).send("Post liked!");
  } catch (error) {
    // Output any errors that occur during the process
    console.error(error);
    // Return a 500 response for server errors.
    return res.status(500).send("Server Error!");
  }
});

// Dynamic Route with postId.
// Method: POST
// Middleware: authMiddleware
router.post("/dislike/:postId", authMiddleware, async (req, res) => {
  try {
    // Extract postId and userId from request parameters and user information.
    const { postId } = req.params;
    const { userId } = req;

    // Find the post in the database based on postId.
    const post = await PostModel.findById(postId);
    // Check if the post exists.
    if (!post) {
      // If no post is found, return a 404 response.
      return res.status(404).send("No Post found!");
    }

    // Check if the user has already disliked the post.
    const isDisLiked =
      post.dislikes.filter((dislike) => dislike.user.toString() === userId)
        .length > 0;

    // If the user has already disliked the post, return a 401 response.
    if (isDisLiked) {
      return res.status(401).send("Post already disliked!");
    }

    // Check if the user has already liked the post.
    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length > 0;

    // If the user has already liked the post, remove the like.
    if (isLiked) {
      post.likes = post.likes.filter((like) => like.user.toString() !== userId);

      post.likesCount--;
      post.dislikesCount++;
      // Save the updated post without the dislike.
      await post.save();

      // Add a new dilike to the post.
      await post.dislikes.unshift({ user: userId });

      // Save the updated post with the new dislike.
      await post.save();

      // Check if the user disliking the post is not the post owner.
      if (post.user.toString() !== userId) {
        // If true, send a new dislike notification to the post owner.
        await newDisLikeNotification(userId, postId, post.user.toString());
      }

      // Return a 200 response indicating that the post has been disliked successfully.
      return res.status(200).send("Post disliked!");
    }

    // Check if the user liking the post is not the post owner.
    if (post.user.toString() !== userId) {
      // If true, send a new like notification to the post owner.
      await newLikeNotification(userId, postId, post.user.toString());
    }

    // If the user hasn't liked and disliked the post, add a new like to the post.
    await post.dislikes.unshift({ user: userId });
    post.dislikesCount++;

    // Save the updated post with the new dislike.
    await post.save();

    // Check if the user disliking the post is not the post owner.
    if (post.user.toString() !== userId) {
      // If true, send a new dislike notification to the post owner.

      await newDisLikeNotification(userId, postId, post.user.toString());
    }

    // Return a 200 response indicating that the post has been disliked successfully.
    return res.status(200).send("Post disliked!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.put("/unlike/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("No Post found!");
    }

    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length === 0;

    if (isLiked) {
      return res.status(401).send("Post not liked before!");
    }

    const index = post.likes
      .map((like) => like.user.toString())
      .indexOf(userId);

    await post.likes.splice(index, 1);

    await post.save();

    if (post.user.toString() !== userId) {
      await removeLikeNotification(userId, postId, post.user.toString());
    }

    return res.status(200).send("Post Unliked!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.put("/undislike/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("No Post found!");
    }

    const isDisLiked =
      post.dislikes.filter((dislike) => dislike.user.toString() === userId)
        .length === 0;

    if (isDisLiked) {
      return res.status(401).send("Post not disliked before!");
    }

    const index = post.dislikes
      .map((dislike) => dislike.user.toString())
      .indexOf(userId);

    await post.dislikes.splice(index, 1);

    await post.save();

    if (post.user.toString() !== userId) {
      await removeDisLikeNotification(userId, postId, post.user.toString());
    }

    return res.status(200).send("Post Undisliked!");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.get("/like/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findById(postId).populate("likes.user");
    if (!post) {
      return res.status(404).send("No Post found!");
    }

    return res.status(200).json(post.likes);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.get("/dislike/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findById(postId).populate("dislikes.user");
    if (!post) {
      return res.status(404).send("No Post found!");
    }

    return res.status(200).json(post.dislikes);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.post("/comment/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;
    const { text } = req.body;

    if (text.length < 1)
      return res.status(401).send("Comment should be at least one character!");

    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).send("Post not found!");

    const newComment = {
      _id: uuid(),
      text,
      user: userId,
      date: Date.now(),
    };

    await post.comments.unshift(newComment);
    await post.save();

    if (post.user.toString() !== userId) {
      await newCommentNotification(
        postId,
        newComment._id,
        userId,
        post.user.toString(),
        text
      );
    }

    return res.status(200).json(newComment._id);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.delete("/:postId/:commentId", authMiddleware, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req;

    const post = await PostModel.findById(postId);
    if (!post) return res.status(404).send("Post not found!");

    const comment = post.comments.find((comment) => comment._id === commentId);
    if (!comment) {
      return res.status(404).send("No Comment found!");
    }

    const user = await UserModel.findById(userId);

    const deleteComment = async () => {
      const indexOf = post.comments
        .map((comment) => comment._id)
        .indexOf(commentId);

      await post.comments.splice(indexOf, 1);

      await post.save();

      if (post.user.toString() !== userId) {
        await removeCommentNotification(
          postId,
          commentId,
          userId,
          post.user.toString()
        );
      }

      return res.status(200).send("Deleted Successfully!");
    };

    if (comment.user.toString() !== userId) {
      if (user.role === "Super") {
        await deleteComment();
      } else {
        return res.status(401).send("Unauthorized!");
      }
    }

    await deleteComment();
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.post("/report/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;
    const { text, postOwnerUserId } = req.body;

    if (postOwnerUserId === userId) {
      return res.status(401).send("Cannot Report Your Post!");
    }

    if (text.length < 1)
      return res.status(401).send("Report should be at least one character!");

    const post = await PostModel.findById(postId);

    if (!post) {
      return res.status(404).send("Post not found!");
    }

    const newReport = {
      _id: uuid(),
      text,
      user: userId,
      date: Date.now(),
    };

    await post.reports.unshift(newReport);
    await PostModel.findByIdAndUpdate(postId, { $inc: { reportsCount: 1 } });
    await post.save();

    if (post.user.toString() !== userId) {
      await newReportPostNotification(
        postId,
        newReport._id,
        userId,
        post.user.toString(),
        text
      );
    }

    return res.status(200).json(newReport._id);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.get("/report/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findById(postId).populate("reports.user");
    if (!post) {
      return res.status(404).send("No Post found!");
    }

    return res.status(200).json(post.reports);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.post("/read/:postId", authMiddleware, async (req, res) => {
  try {
    // Extract postId and userId from request parameters and user information.
    const { postId } = req.params;
    const { userId } = req;

    // Find the post in the database based on postId.
    const post = await PostModel.findById(postId);

    // Find the owner of the post in the database based on postId.
    const user = await UserModel.findById(post.user);

    // Check if the post exists.
    if (!post) {
      // If no post is found, return a 404 response.
      return res.status(404).send("No Post found!");
    }

    // Check if the user reading the post is the post owner.
    if (post.user.toString() === userId) {
      return;
    }

    // Check if the user has already read the post.
    const isRead =
      post.reads.filter((read) => read.user.toString() === userId).length > 0;

    if (
      user.role === "Corporate" &&
      (post.type === "Ad" || post.type === "Job")
    ) {
      user.accountBalance -= 0.1;
    }
    if (isRead) {
      return;
    }

    // If the user hasn't read the post, add a new read to the post.
    await post.reads.unshift({ user: userId });

    // Save the updated user accountBalance.
    await user.save();

    // Save the updated post with the new read.
    await post.save();

    // Check if the user reading the post is not the post owner.
    if (post.user.toString() !== userId) {
      // If true, send a new read notification to the post owner.
      await newReadNotification(userId, postId, post.user.toString());
    }

    // Return a 200 response indicating that the post has been read successfully.
    return res.status(200).send("Post read!");
  } catch (error) {
    // Output any errors that occur during the process
    console.error(error);
    // Return a 500 response for server errors.
    return res.status(500).send("Server Error!");
  }
});

router.get("/read/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findById(postId).populate("reads.user");
    if (!post) {
      return res.status(404).send("No Post found!");
    }

    return res.status(200).json(post.reads);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

router.post("/tip/:postId", authMiddleware, async (req, res) => {
  try {
    // Extract postId and userId from request parameters and user information.
    const { postId } = req.params;
    const { userId, postOwnerUserId, tip } = req.body;

    const tipAmount = Number(tip);

    const user = await UserModel.findById(userId);
    const post = await PostModel.findById(postId);

    // Check if the user has enough balance and tips combined to tip.
    if (user.accountBalance + user.tips < tipAmount) {
      return res.status(400).send("Insufficient Account Balance For Tipping!");
    }

    // // Check if the user has enough balance to tip.
    // if (user.accountBalance < tipAmount) {
    //   return res.status(400).send("Insufficient Account Balance For Tipping!");
    // }

    // // Deduct the tipAmount from the user's accountBalance.
    // user.accountBalance -= tipAmount;

    // Deduct the tipAmount from the user's accountBalance or tips (whichever is available).
    if (user.accountBalance >= tipAmount) {
      user.accountBalance -= tipAmount;
    } else {
      // If the account balance is not enough, deduct from tips.
      user.tips -= tipAmount - user.accountBalance;
      user.accountBalance = 0;
    }

    // Add the tipAmount to the post owner's tips.
    const postOwner = await UserModel.findById(postOwnerUserId);

    if (!postOwner) {
      return res.status(404).send("Post Owner Not Found!");
    }

    postOwner.tips += tipAmount;

    // Save the changes to both the user and post owner
    await user.save();
    await postOwner.save();

    // Check if the user tipping the post is not the post owner.
    if (post.user.toString() !== userId) {
      // If true, send a new tip notification to the post owner.
      await newTipNotification(userId, postId, post.user.toString());
    }

    // Return a 200 response indicating that the post has been read successfully.
    return res.status(200).send("Post Tipped!");
  } catch (error) {
    // Output any errors that occur during the process
    console.error(error);
    // Return a 500 response for server errors.
    return res.status(500).send("Server Error!");
  }
});

module.exports = router;
