import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useRouter } from "next/router";
import cookie from "js-cookie";
import { parseCookies } from "nookies";
import { Segment, Header, Divider, Comment, Grid } from "semantic-ui-react";
import baseUrl from "../utils/baseUrl";
import Chat from "../components/Chats/Chat";
import ChatListSearch from "../components/Chats/ChatListSearch";
import { NoMessages } from "../components/Layout/NoData";
import Banner from "../components/Messages/Banner";
import MessageInputField from "../components/Messages/MessageInputField";
import Message from "../components/Messages/Message";
import getUserInfo from "../utils/getUserInfo";
import newMsgSound from "../utils/newMsgSound";

const scrollDivToBottom = (divRef) =>
  divRef.current !== null &&
  divRef.current.scrollIntoView({ behaviour: "smooth" });

function Messages({ chatsData, user }) {
  let [chats, setChats] = useState(chatsData);

  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [bannerData, setBannerData] = useState({ name: "", profilePicUrl: "" });
  const router = useRouter();
  const socket = useRef();
  const openChatId = useRef("");
  const divRef = useRef();

  useEffect(() => {
    if (!user) {
      window.location.href = "/popular";
    }

    if (!socket.current) {
      // Connecting with the server.
      socket.current = io(baseUrl);
    }
    if (socket.current) {
      // Send data to the server.
      socket.current.emit("join", { userId: user._id });
      socket.current.on("connectedUsers", ({ users }) => {
        users.length > 0 && setConnectedUsers(users);
      });
    }
    if (chats.length > 0 && !router.query.message) {
      router.push(`/messages?message=${chats[0].messagesWith}`, undefined, {
        shallow: true,
      });
    }
  }, []);

  useEffect(() => {
    const loadMessages = () => {
      socket.current.emit("loadMessages", {
        userId: user._id,
        messagesWith: router.query.message,
      });

      socket.current.on("messagesLoaded", async ({ chat }) => {
        setMessages(chat.messages);
        setBannerData({
          name: chat.messagesWith.name,
          profilePicUrl: chat.messagesWith.profilePicUrl,
        });

        openChatId.current = chat.messagesWith._id;
        divRef.current && scrollDivToBottom(divRef);
      });

      socket.current.on("noChatFound", async () => {
        const { name, profilePicUrl } = await getUserInfo(router.query.message);
        setBannerData({ name, profilePicUrl });
        setMessages([]);
        openChatId.current = router.query.message;
      });
    };

    if (socket.current && router.query.message) loadMessages();
  }, [router.query.message]);

  const sendMsg = async (msg) => {
    if (socket.current) {
      socket.current.emit("sendNewMsg", {
        userId: user._id,
        msgSendToUserId: openChatId.current,
        msg,
      });
    }
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msgSent", ({ newMsg }) => {
        if (newMsg.receiver === openChatId.current) {
          setMessages((prev) => [...prev, newMsg]);
          setChats((prev) => {
            const previousChat = prev.find(
              (chat) => chat.messagesWith === newMsg.receiver
            );
            previousChat.lastMessage = newMsg.msg;
            previousChat.date = newMsg.date;
            return [...prev];
          });
        }
      });
      socket.current.on("newMsgReceived", async ({ newMsg }) => {
        let senderName;
        if (newMsg.sender === openChatId.current) {
          setMessages((prev) => [...prev, newMsg]);
          setChats((prev) => {
            const previousChat = prev.find(
              (chat) => chat.messagesWith === newMsg.sender
            );
            previousChat.lastMessage = newMsg.msg;
            previousChat.date = newMsg.date;
            senderName = previousChat.name;
            return [...prev];
          });
        } else {
          const ifPreviouslyMessaged =
            chats.filter((chat) => chat.messagesWith === newMsg.sender).length >
            0;
          if (ifPreviouslyMessaged) {
            setChats((prev) => {
              const previousChat = prev.find(
                (chat) => chat.messagesWith === newMsg.sender
              );
              previousChat.lastMessage = newMsg.msg;
              previousChat.date = newMsg.date;
              senderName = previousChat.name;
              return [...prev];
            });
          } else {
            const { name, profilePicUrl } = await getUserInfo(newMsg.sender);

            senderName = name;
            const newChat = {
              messagesWith: newMsg.sender,
              name,
              profilePicUrl,
              lastMessage: newMsg.msg,
              date: newMsg.date,
            };
            setChats((prev) => {
              const previousChat = Boolean(
                prev.find((chat) => chat.messagesWith === newMsg.sender)
              );

              if (previousChat) {
                return [
                  newChat,
                  ...prev.filter((chat) => chat.messagesWith !== newMsg.sender),
                ];
              } else {
                return [newChat, ...prev];
              }
            });
          }
        }
        newMsgSound(senderName);
      });
    }
  }, []);

  if (!chats) {
    chats = [];
  }

  useEffect(() => {
    messages.length > 0 && scrollDivToBottom(divRef);
  }, [messages]);

  const deleteMsg = (messageId) => {
    if (socket.current) {
      socket.current.emit("deleteMsg", {
        userId: user._id,
        messagesWith: openChatId.current,
        messageId,
      });

      socket.current.on("msgDeleted", () => {
        setMessages((prev) =>
          prev.filter((message) => message._id !== messageId)
        );
      });
    }
  };

  const deleteChat = async (messagesWith) => {
    try {
      await axios.delete(`${baseUrl}/api/chats/${messagesWith}`, {
        headers: { Authorization: cookie.get("token") },
      });

      setChats((prev) =>
        prev.filter((chat) => chat.messagesWith !== messagesWith)
      );
      router.push("/messages", undefined, { shallow: true });
      openChatId.current = "";
    } catch (error) {
      setChats((prev) =>
        prev.filter((chat) => chat.messagesWith !== messagesWith)
      );
      router.push("/messages", undefined, { shallow: true });
      openChatId.current = "";
    }
  };

  return (
    <>
      <Segment padded basic size="large" style={{ marginTop: "5px" }}>
        <Header
          icon="home"
          content="Go to Homepage"
          onClick={() => router.push("/")}
          style={{ cursor: "pointer" }}
          color="blue"
        />
        <Divider hidden />

        <div style={{ marginBottom: "10px" }}>
          <ChatListSearch chats={chats} setChats={setChats} />
        </div>

        {chats.length > 0 ? (
          <>
            <>
              <Grid stackable>
                <Grid.Column width={4}>
                  <Comment.Group size="big">
                    <Segment
                      raised
                      style={{ overflow: "auto", maxHeight: "32rem" }}
                    >
                      {chats.map((chat, i) => (
                        <Chat
                          key={i}
                          chat={chat}
                          connectedUsers={connectedUsers}
                          deleteChat={deleteChat}
                        />
                      ))}
                    </Segment>
                  </Comment.Group>
                </Grid.Column>
                <Grid.Column width={12}>
                  {router.query.message && (
                    <>
                      <div
                        style={{
                          overflow: "auto",
                          overflowX: "hidden",
                          maxHeight: "35rem",
                          height: "35rem",
                          backgroundColor: "whitesmoke",
                        }}
                      >
                        <div style={{ position: "sticky", top: "0" }}>
                          <Banner bannerData={bannerData} />
                        </div>

                        {messages.length > 0 &&
                          messages.map((message, i) => (
                            <Message
                              divRef={divRef}
                              key={i}
                              bannerProfilePic={bannerData.profilePicUrl}
                              message={message}
                              user={user}
                              deleteMsg={deleteMsg}
                            />
                          ))}
                      </div>

                      <MessageInputField sendMsg={sendMsg} />
                    </>
                  )}
                </Grid.Column>
              </Grid>
            </>
          </>
        ) : (
          <NoMessages />
        )}
      </Segment>
    </>
  );
}

Messages.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/chats`, {
      headers: { Authorization: token },
    });

    return { chatsData: res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default Messages;
