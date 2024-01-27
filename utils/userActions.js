import axios from "axios";
import cookie from "js-cookie";
import baseUrl from "./baseUrl";
import catchErrors from "./catchErrors";

const Axios = axios.create({
  baseURL: `${baseUrl}/api/user`,
  headers: { Authorization: cookie.get("token") },
});

export const reportUser = async (userToReportId) => {
  try {
    await Axios.post(`/report/${userToReportId}`);
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const unreportUser = async (userToUnreportId) => {
  try {
    await Axios.put(`/unreport/${userToUnreportId}`);
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const resetreportUser = async (userToUnreportId) => {
  try {
    await Axios.put(`/reportreset/${userToUnreportId}`);
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const depositMoney = async (
  userId,
  setSuccess,
  setErrorAccountBalance,
  inputAmount
) => {
  try {
    await Axios.post(`/deposit/${userId}`, { inputAmount });
    setSuccess(true);
  } catch (error) {
    setErrorAccountBalance(true);
    alert(catchErrors(error));
  }
};

export const withdrawMoney = async (
  userId,
  setSuccess,
  setErrorAccountBalance,
  inputAmount
) => {
  try {
    await Axios.put(`/withdraw/${userId}`, { inputAmount });
    setSuccess(true);
  } catch (error) {
    setErrorAccountBalance(true);
    alert(catchErrors(error));
  }
};

export const deleteUser = async (userId, setShowToastr) => {
  try {
    await Axios.delete(`/${userId}`);
    setShowToastr(true);
  } catch (error) {
    alert(catchErrors(error));
  }
};
