import axios from "axios";
import baseUrl from "./baseUrl";
import catchErrors from "./catchErrors";
import cookie from "js-cookie";

const Axios = axios.create({
  baseURL: `${baseUrl}/api/posts`,
  headers: { Authorization: cookie.get("token") },
});

export const submitNewPost = async (
  text,
  location,
  company,
  language,
  type,
  keywords,
  picUrl,
  picCaption,
  sentiment,
  topic,
  adultContent,
  setPosts,
  setNewPost,
  setError
) => {
  try {
    const res = await Axios.post("/", {
      text,
      location,
      company,
      language,
      type,
      keywords,
      picUrl,
      picCaption,
      sentiment,
      topic,
      adultContent,
    });

    setPosts((prev) => [res.data, ...prev]);
    setNewPost({
      text: "",
      location: "",
      company: "",
      language: "",
      type: "",
      keywords: [],
    });
  } catch (error) {
    const errorMsg = catchErrors(error);
    setError(errorMsg);
    // window.location.href = "/popular";
  }
};

export const deletePost = async (postId, setPosts, setShowPostToastr) => {
  try {
    await Axios.delete(`/${postId}`);
    setPosts((prev) => prev.filter((post) => post._id !== postId));
    setShowPostToastr(true);
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const likePost = async (
  postId,
  userId,
  setLikes,
  setDisLikes,
  like = true
) => {
  try {
    if (like) {
      await Axios.post(`/like/${postId}`);
      setLikes((prev) => [...prev, { user: userId }]);
      // setDisLikes((prev) => [...prev, { user: userId }]);
      setDisLikes((prev) => prev.filter((dislike) => dislike.user !== userId));
    } else if (!like) {
      await Axios.put(`/unlike/${postId}`);
      setLikes((prev) => prev.filter((like) => like.user !== userId));
      // setDisLikes((prev) => prev.filter((dislike) => dislike.user !== userId));
    }
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const dislikePost = async (
  postId,
  userId,
  setDisLikes,
  setLikes,
  dislike = true,
  like
) => {
  try {
    if (dislike) {
      await Axios.post(`/dislike/${postId}`);
      setDisLikes((prev) => [...prev, { user: userId }]);
      setLikes((prev) => prev.filter((like) => like.user !== userId));
    } else if (!dislike) {
      await Axios.put(`/undislike/${postId}`);
      setDisLikes((prev) => prev.filter((dislike) => dislike.user !== userId));
      // setLikes((prev) => [...prev, { user: userId }]);
    }
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const postComment = async (postId, user, text, setComments, setText) => {
  try {
    const res = await Axios.post(`/comment/${postId}`, { text });
    const newComment = {
      _id: res.data,
      user,
      text,
      date: Date.now(),
    };

    setComments((prev) => [newComment, ...prev]);
    setText("");
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const deleteComment = async (postId, commentId, setComments) => {
  try {
    await Axios.delete(`/${postId}/${commentId}`);
    setComments((prev) => prev.filter((comment) => comment._id !== commentId));
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const reportPost = async (
  post,
  user,
  text,
  setReports,
  setText,
  setError,
  setOpenReport
) => {
  const postId = post._id;
  const postOwnerUserId = post.user._id;

  try {
    const res = await Axios.post(`/report/${postId}`, {
      text,
      postOwnerUserId,
    });
    const newReport = {
      _id: res.data,
      user,
      text,
      date: Date.now(),
    };

    setReports((prev) => [newReport, ...prev]);
    setText("");
    setOpenReport(false);
  } catch (error) {
    const errorMsg = catchErrors(error);
    setError(errorMsg);
    setOpenReport(true);
  }
};

export const readPost = async (postId, userId, setReads) => {
  try {
    await Axios.post(`/read/${postId}`);
    setReads((prev) => [...prev, { user: userId }]);
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const tipPost = async (post, userId, tip) => {
  const postId = post._id;
  const postOwnerUserId = post.user._id;

  try {
    await Axios.post(`/tip/${postId}`, { userId, postOwnerUserId, tip });
  } catch (error) {
    alert(catchErrors(error));
  }
};
