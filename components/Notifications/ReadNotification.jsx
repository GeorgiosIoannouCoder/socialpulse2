import React from "react";
import { Feed, Divider } from "semantic-ui-react";
import calculateTime from "../../utils/calculateTime";

function ReadNotification({ user, notification }) {
  return (
    <>
      <Feed.Event>
        <Feed.Label image={notification.user.profilePicUrl} />
        <Feed.Content>
          <Feed.Summary>
            <>
              <Feed.User as="a" href={`/${notification.user.username}`}>
                {notification.user.name}
              </Feed.User>{" "}
              read your <a href={`/post/${notification.post._id}`}>post.</a>{" "}
              <Feed.Date>{calculateTime(notification.date)}</Feed.Date>
              {user.role === "Corporate" &&
                (notification.post.type === "Ad" ||
                  notification.post.type === "Job") && (
                  <Feed.Summary>
                    <>You have been charged $0.10.</>
                  </Feed.Summary>
                )}
            </>
          </Feed.Summary>

          {notification.post.picUrl && (
            <Feed.Extra images>
              <a href={`/post/${notification.post._id}`}>
                <img src={notification.post.picUrl} />
              </a>
            </Feed.Extra>
          )}
        </Feed.Content>
      </Feed.Event>
      <br />
      <Divider />
    </>
  );
}

export default ReadNotification;
