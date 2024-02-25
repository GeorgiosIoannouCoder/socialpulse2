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
} = require("../utilsServer/notificationActions");
const tabooWords = require("../utils/tabooWords");

router.post("/", authMiddleware, async (req, res) => {
  try {
    let { text } = req.body;
    const { location, company, language, type, keywords, picUrl } = req.body;

    const user = await UserModel.findById(req.userId);
    const role = user.role;

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

    // function to replace taboowords with ****
    function censorTabooWords() {
      //variable to be the new text
      let newText = "";

      // variable to get all the words in the users text
      let textWords = text.split(" ");

      // iterate through all textWords
      for (let i = 0; i < textWords.length; i++) {
        if (tabooWords.includes(textWords[i])) {
          let lenOfTabooWord = textWords[i].length;
          let stars = "";

          // get the appropriate number of stars
          for (let j = 0; j < lenOfTabooWord; j++) {
            stars += "*";
          }
          textWords[i] = stars;
        }
      }
      newText = textWords.join(" ");

      return newText;
    }

    // variable to store the number of taboowords the user has
    let taboowords = countTabooWords();

    // checking the number of taboowords the user has
    if (taboowords >= 3) {
      return res.status(401).send("Post cannot have more than 3 taboo words!");
    }

    if (text.length < 1) {
      return res.status(401).send("Text must be at least one character!");
    }

    if (!keywords[keywords.length - 1]) {
      return res.status(401).send("Please select at least one keyword!");
    }

    if (!language) {
      return res.status(401).send("What is the language of the post?");
    }

    // replace text with the censored version
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

    if (language) {
      newPost.language = language;
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

    const post = await new PostModel(newPost).save();

    const postCreated = await PostModel.findById(post._id).populate("user");

    return res.json(postCreated);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error!");
  }
});

// route to only show trendy posts
router.get("/", authMiddleware, async (req, res) => {
  try {
    const trendyPosts = await PostModel.find({ kind: "Trendy" })
      .sort({ likesCount: -1 })
      .populate("user")
      .populate("comments.user");

    if (trendyPosts.length === 0) {
      return res.json([]);
    }

    // Update post type to "Trendy" based on conditions
    for (const post of trendyPosts) {
      const shouldUpdateType =
        post.reads.length > 10 && post.likesCount - post.dislikesCount > 3;

      if (shouldUpdateType && post.kind !== "Trendy") {
        await PostModel.findByIdAndUpdate(post._id, { kind: "Trendy" });
      }
    }

    return res.json(trendyPosts);
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
      await PostModel.findByIdAndUpdate(post._id, { kind: "Trendy" });
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

    // If the user has already read the post, return a 401 response.
    // if (isRead) {
    //   return res.status(401).send("Post already read!");
    // }
    if (isRead) {
      return;
    }

    // If the user hasn't read the post, add a new read to the post.
    await post.reads.unshift({ user: userId });

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

module.exports = router;
