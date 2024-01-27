import React from "react";
import { Feed, Divider, Icon } from "semantic-ui-react";
import calculateTime from "../../utils/calculateTime";

function TipNotification({ notification, accountBalance, tips }) {
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
              tip your <a href={`/post/${notification.post._id}`}>post</a>{" "}
              <Icon
                name="dollar sign"
                color="green"
                style={{ marginLeft: "-10px" }}
                fitted
              />
              <Icon
                name="dollar sign"
                color="green"
                style={{ marginLeft: "-10px" }}
                fitted
              />
              <Icon
                name="dollar sign"
                color="green"
                style={{ marginLeft: "-10px" }}
                fitted
              />
              <Feed.Date>{calculateTime(notification.date)}</Feed.Date>
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

export default TipNotification;
