import React from "react";
import { Feed, Divider } from "semantic-ui-react";
import calculateTime from "../../utils/calculateTime";

function DepositNotification({ notification, accountBalance, tips }) {
  return (
    <>
      <Feed.Event>
        <Feed.Label image="https://www.dictionary.com/e/wp-content/uploads/2018/09/heavy-dollar-sign.png" />
        <Feed.Content>
          <Feed.Summary>
            <>
              You have made a new{" "}
              <strong style={{ color: "#00ff00" }}>DEPOSIT</strong> to your
              account.
              <Feed.Date>{calculateTime(notification.date)}</Feed.Date>
            </>
          </Feed.Summary>
        </Feed.Content>
      </Feed.Event>
      <br />
      <Divider />
    </>
  );
}

export default DepositNotification;
