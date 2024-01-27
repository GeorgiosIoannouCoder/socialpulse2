import React, { useState, useEffect } from "react";
import { Divider, Feed, Icon } from "semantic-ui-react";
import calculateTime from "../../utils/calculateTime";
import axios from "axios";
import baseUrl from "../../utils/baseUrl";
import cookie from "js-cookie";

function ReportUserNotification({ user, notification }) {
  return (
    <>
      <Feed.Event>
        <Feed.Label image={notification.user.profilePicUrl} />
        <Feed.Content>
          <Feed.Summary>
            <>
              Super User{" "}
              <Feed.User as="a" href={`/${notification.user.username}`}>
                {notification.user.name}
              </Feed.User>{" "}
              reported your account{" "}
              <Icon
                name="exclamation"
                color="red"
                style={{ marginLeft: "-10px" }}
                fitted
              />
              <Icon
                name="exclamation"
                color="red"
                style={{ marginLeft: "-10px" }}
                fitted
              />
              <Icon
                name="exclamation"
                color="red"
                style={{ marginLeft: "-10px" }}
                fitted
              />
              <Feed.Date>{calculateTime(notification.date)}</Feed.Date>
              <br />
              {user.role !== "Super" && (
                <Feed.Extra text>
                  <b style={{ color: "red" }}>Super User Handling The Case: </b>
                  <strong style={{ color: "red" }}>
                    <u>
                      <a href={`/${notification.user.username}`}>
                        {notification.user.name}
                      </a>
                    </u>
                  </strong>
                </Feed.Extra>
              )}
            </>
          </Feed.Summary>
        </Feed.Content>
      </Feed.Event>
      <Divider />
    </>
  );
}

export default ReportUserNotification;
