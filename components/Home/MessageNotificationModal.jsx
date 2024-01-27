import React, { useState } from "react";
import Link from "next/link";
import { Form, Modal, Segment, List, Icon } from "semantic-ui-react";
import calculateTime from "../../utils/calculateTime";

function MessageNotificationModal({
  socket,
  showNewMessageModal,
  newMessageModal,
  newMessageReceived,
  user,
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const onModalClose = () => showNewMessageModal(false);
  const formSubmit = (e) => {
    e.preventDefault();

    if (socket.current) {
      socket.current.emit("sendMsgFromNotification", {
        userId: user._id,
        msgSendToUserId: newMessageReceived.sender,
        msg: text,
      });

      socket.current.on("msgSentFromNotification", () => {
        showNewMessageModal(false);
      });
    }
  };

  return (
    <>
      <Modal
        size="small"
        open={newMessageModal}
        onClose={onModalClose}
        closeIcon
        closeOnDimmerClick
      >
        <Modal.Header
          content={`New Message from ${newMessageReceived.senderName}`}
        />

        <Modal.Content>
          <div className="bubbleWrapper">
            <div className="inlineContainer">
              <img
                className="inlineIcon"
                src={newMessageReceived.senderProfilePic}
              />
            </div>

            <div className="otherBubble other">{newMessageReceived.msg}</div>

            <span className="other">
              {calculateTime(newMessageReceived.date)}
            </span>
          </div>

          <div style={{ position: "sticky", bottom: "0px" }}>
            <Segment secondary color="blue" attached="top">
              <Form reply onSubmit={formSubmit}>
                <Form.Input
                  size="large"
                  placeholder="Send New Message"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  action={{
                    color: "blue",
                    icon: "telegram plane",
                    disabled: text === "",
                    loading: loading,
                  }}
                />
              </Form>
            </Segment>
          </div>

          <div style={{ marginTop: "5px" }}>
            <Link href={`/messages?message=${newMessageReceived.sender}`}>
              <a>View All Messages</a>
            </Link>

            <br />

            <Instructions username={user.username} />
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
}

const Instructions = ({ username }) => (
  <List>
    <List.Item>
      <Icon name="help" />
      <List.Content>
        <List.Header>
          If you do not like this message popup to appear when you receive a new
          message:
        </List.Header>
      </List.Content>
    </List.Item>

    <List.Item>
      <Icon name="hand point right" />
      <List.Content>
        You can disable it by going to your
        <Link href={`/${username}`}>
          <a> Account </a>
        </Link>
        page and clicking on the Settings tab header.
      </List.Content>
    </List.Item>

    <List.Item>
      <Icon name="hand point right" />
      Inside the menu, there will be a setting named: Show New Message Popup?
    </List.Item>

    <List.Item>
      <Icon name="hand point right" />
      Just toggle the setting to disable/enable this feature.
    </List.Item>
  </List>
);

export default MessageNotificationModal;
