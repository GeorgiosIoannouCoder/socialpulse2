import React, { useEffect, useState, useRef, Fragment } from "react";
import io from "socket.io-client";
import { Feed, Segment, Divider, Container } from "semantic-ui-react";
import axios from "axios";
import cookie from "js-cookie";
import { parseCookies } from "nookies";
import baseUrl from "../utils/baseUrl";
import { NoNotifications } from "../components/Layout/NoData";
import LikeNotification from "../components/Notifications/LikeNotification";
import CommentNotification from "../components/Notifications/CommentNotification";
import FollowerNotification from "../components/Notifications/FollowerNotification";
import MessageNotificationModal from "../components/Home/MessageNotificationModal";
import ReportPostNotification from "../components/Notifications/ReportPostNotification";
import ReportPostSurferNotification from "../components/Notifications/ReportPostSurferNotification";
import ReportProfileNotification from "../components/Notifications/ReportProfileNotification";
import ReportUserNotification from "../components/Notifications/ReportUserNotification";
import ReadNotification from "../components/Notifications/ReadNotification";
import newMsgSound from "../utils/newMsgSound";
import getUserInfo from "../utils/getUserInfo";
import DepositNotification from "../components/Notifications/DepositNotification";
import WithdrawNotification from "../components/Notifications/WithdrawNotification";
import TipNotification from "../components/Notifications/TipNotification";
import DislikeNotification from "../components/Notifications/DislikeNotification";

function Notifications({ notifications, errorLoading, user, userFollowStats }) {
  const [loggedUserFollowStats, setUserFollowStats] = useState(userFollowStats);
  const socket = useRef();
  const [newMessageReceived, setNewMessageReceived] = useState(null);
  const [newMessageModal, showNewMessageModal] = useState(false);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io(baseUrl);
    }

    if (socket.current) {
      socket.current.emit("join", { userId: user._id });

      socket.current.on("newMsgReceived", async ({ newMsg }) => {
        const { name, profilePicUrl } = await getUserInfo(newMsg.sender);

        if (user.newMessagePopup) {
          setNewMessageReceived({
            ...newMsg,
            senderName: name,
            senderProfilePic: profilePicUrl,
          });
          showNewMessageModal(true);
        }
        newMsgSound(name);
      });
    }

    const notificationRead = async () => {
      try {
        await axios.post(
          `${baseUrl}/api/notifications`,
          {},
          { headers: { Authorization: cookie.get("token") } }
        );
      } catch (error) {
        // console.log(error);
      }
    };

    return () => {
      notificationRead();
    };
  }, []);

  return (
    <>
      {user ? (
        <>
          {newMessageModal && newMessageReceived !== null && (
            <MessageNotificationModal
              socket={socket}
              showNewMessageModal={showNewMessageModal}
              newMessageModal={newMessageModal}
              newMessageReceived={newMessageReceived}
              user={user}
            />
          )}
          <Container style={{ marginTop: "1.5rem" }}>
            {notifications.length > 0 ? (
              <Segment color="blue" raised>
                <div
                  style={{
                    maxHeight: "40rem",
                    overflow: "auto",
                    height: "40rem",
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <Feed size="small">
                    {notifications.map((notification) => (
                      <Fragment key={notification._id}>
                        {notification.type === "newRead" &&
                          notification.post !== null && (
                            <ReadNotification
                              key={notification._id}
                              user={user}
                              notification={notification}
                            />
                          )}
                        {notification.type === "newLike" &&
                          notification.post !== null && (
                            <LikeNotification
                              key={notification._id}
                              notification={notification}
                            />
                          )}
                        {notification.type === "newDisLike" &&
                          notification.post !== null && (
                            <DislikeNotification
                              key={notification._id}
                              notification={notification}
                            />
                          )}
                        {notification.type === "newComment" &&
                          notification.post !== null && (
                            <CommentNotification
                              key={notification._id}
                              notification={notification}
                            />
                          )}

                        {notification.type === "newReportPost" &&
                          notification.post !== null && (
                            <ReportPostNotification
                              key={notification._id}
                              user={user}
                              notification={notification}
                            />
                          )}
                        {notification.type === "newReportPostSurfer" &&
                          notification.post !== null && (
                            <ReportPostSurferNotification
                              key={notification._id}
                              user={user}
                              notification={notification}
                            />
                          )}
                        {notification.type === "newReportProfile" &&
                          notification.profile !== null && (
                            <ReportProfileNotification
                              key={notification._id}
                              user={user}
                              notification={notification}
                            />
                          )}
                        {notification.type === "newSuperUserReport" &&
                          notification.profile !== null && (
                            <ReportUserNotification
                              key={notification._id}
                              user={user}
                              notification={notification}
                            />
                          )}
                        {notification.type === "newFollower" && (
                          <FollowerNotification
                            key={notification._id}
                            notification={notification}
                            loggedUserFollowStats={loggedUserFollowStats}
                            setUserFollowStats={setUserFollowStats}
                          />
                        )}
                        {notification.type === "newDeposit" && (
                          <DepositNotification
                            key={notification._id}
                            notification={notification}
                            accountBalance={user.accountBalance}
                            tips={user.tips}
                          />
                        )}
                        {notification.type === "newWithdraw" && (
                          <WithdrawNotification
                            key={notification._id}
                            notification={notification}
                            accountBalance={user.accountBalance}
                            tips={user.tips}
                          />
                        )}
                        {notification.type === "newTip" && (
                          <TipNotification
                            key={notification._id}
                            notification={notification}
                            accountBalance={user.accountBalance}
                            tips={user.tips}
                          />
                        )}
                      </Fragment>
                    ))}
                  </Feed>
                </div>
              </Segment>
            ) : (
              <NoNotifications />
            )}
            <Divider hidden />
          </Container>
        </>
      ) : (
        typeof window !== "undefined" &&
        (window.location.href = "/noprofilefound")
      )}
    </>
  );
}

Notifications.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/notifications`, {
      headers: { Authorization: token },
    });

    return { notifications: res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default Notifications;
