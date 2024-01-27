import React, { useState, useEffect } from "react";
import { Divider, Feed, Icon } from "semantic-ui-react";
import calculateTime from "../../utils/calculateTime";
import axios from "axios";
import baseUrl from "../../utils/baseUrl";
import cookie from "js-cookie";

function ReportProfileNotification({ user, notification }) {
  const [reportedUserName, setReportedUserName] = useState("");
  const [reportedUserUserName, setReportedUserUserName] = useState("");

  const [superUserName, setSuperUserName] = useState("");
  const [superUserUserName, setSuperUserUserName] = useState("");

  useEffect(() => {
    const getReportedUser = async () => {
      try {
        const res = await axios.get(
          `${baseUrl}/api/profile/id/${notification.profile.user}`,
          {
            headers: { Authorization: cookie.get("token") },
          }
        );

        setReportedUserName(res.data.user.name);
        setReportedUserUserName(res.data.user.username);
      } catch (error) {
        alert(error);
      }
    };

    getReportedUser();
  }, []);

  useEffect(() => {
    const getSuperUser = async () => {
      try {
        const res = await axios.get(
          `${baseUrl}/api/profile/id/${notification.superUser}`,
          {
            headers: { Authorization: cookie.get("token") },
          }
        );

        setSuperUserName(res.data.user.name);
        setSuperUserUserName(res.data.user.username);
      } catch (error) {
        alert(error);
      }
    };

    getSuperUser();
  }, []);
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
              {user.role === "Super" ? (
                <>
                  {" "}
                  reported this <a href={`/${reportedUserUserName}`}>profile</a>
                </>
              ) : (
                <>
                  {" "}
                  reported your <a href={`/${reportedUserUserName}`}>profile</a>
                </>
              )}{" "}
              <Icon
                name="exclamation"
                color="red"
                style={{ marginLeft: "0px" }}
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
            </>
          </Feed.Summary>

          <Feed.Extra text>
            <b>Report Description: </b>
            <strong style={{ color: "red" }}>{notification.text}</strong>
          </Feed.Extra>
          {user.role === "Super" && (
            <Feed.Extra text>
              <b style={{ color: "red" }}>Affected User: </b>
              <strong style={{ color: "red" }}>
                <u>
                  <a href={`/${reportedUserUserName}`}>{reportedUserName}</a>
                </u>
              </strong>
            </Feed.Extra>
          )}
          {user.role !== "Super" && (
            <Feed.Extra text>
              <b style={{ color: "red" }}>Super User Handling The Case: </b>
              <strong style={{ color: "red" }}>
                <u>
                  <a href={`/${superUserUserName}`}>{superUserName}</a>
                </u>
              </strong>
            </Feed.Extra>
          )}
        </Feed.Content>
      </Feed.Event>
      <Divider />
    </>
  );
}

export default ReportProfileNotification;
