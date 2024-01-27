import axios from "axios";
import baseUrl from "./baseUrl";
import catchErrors from "./catchErrors";

const Axios = axios.create({
  baseURL: `${baseUrl}/api/popular`,
});

export const reportPostSurfer = async (
  post,
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
