import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Segment } from "semantic-ui-react";
import axios from "axios";
import cookie from "js-cookie";
import baseUrl from "../utils/baseUrl";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  PlaceHolderPosts,
  EndMessage,
} from "../components/Layout/PlaceHolderGroup";
import io from "socket.io-client";
import ExtSearchCardPost from "../components/Post/ExtSearchCardPost";
import { PostDeleteToastr } from "../components/Layout/Toastr";
import CardPost from "../components/Post/CardPost";

function ExtSearch(user) {
  const [username, setUsername] = useState("");
  const [keywords, setKeywords] = useState("");
  const [dislikesCount, setDislikesCount] = useState("");
  const [likesCount, setLikesCount] = useState("");
  const [resultsUsers, setResultsUsers] = useState([]);
  const [results, setResults] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const [showToastr, setShowToastr] = useState(false);
  useEffect(() => {
    showToastr && setTimeout(() => setShowToastr(false), 3000);
  }, [showToastr]);

  const [newMessageModal, showNewMessageModal] = useState(false);

  const fetchDataOnScroll = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/posts`, {
        headers: { Authorization: cookie.get("token") },
        params: { pageNumber },
      });

      if (res.data.length === 0) {
        setHasMore(false);
      }

      setPosts((prev) => [...prev, ...res.data]);
      setPageNumber((prev) => prev + 1);
    } catch (error) {
      alert("Error fetching Posts!");
    }
  };

  const [posts, setPosts] = useState([]);
  const [pageNumber, setPageNumber] = useState(2);
  const socket = useRef();
  const [newMessageReceived, setNewMessageReceived] = useState(null);

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
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.get(
        `${baseUrl}/api/extsearch/${
          username ? username.toLowerCase() : "null"
        }/${likesCount ? likesCount : "null"}/${
          dislikesCount ? dislikesCount : "null"
        }/${
          keywords
            ? keywords.charAt(0).toUpperCase() + keywords.slice(1)
            : "null"
        }`,
        { headers: { Authorization: cookie.get("token") } }
      );

      setResultsUsers(res.data.resultsUsers);

      setResults(res.data.results); // Set the results in state.
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };
  return (
    <>
      {showToastr && <PostDeleteToastr />}
      <Segment
        style={{
          marginTop: "20px",
          backgroundColor: "#23272f",
          color: "white",
        }}
      >
        <Form onSubmit={handleSubmit}>
          <Form.Group widths={2}>
            <Form.Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              label={<label style={{ color: "white" }}>Username</label>}
              placeholder="Enter Username"
            />
            <Form.Input
              label={
                <label style={{ color: "white" }}>
                  Keyword (without the @)
                </label>
              }
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Enter Keyword"
              value={keywords}
            />
            <Form.Input
              label={
                <label style={{ color: "white" }}>Quantity of likes</label>
              }
              onChange={(e) => setLikesCount(e.target.value)}
              placeholder="Enter # likes"
              value={likesCount}
            />
            <Form.Input
              label={
                <label style={{ color: "white" }}>Quantity of dislikes</label>
              }
              onChange={(e) => setDislikesCount(e.target.value)}
              placeholder="Enter # dislikes"
              value={dislikesCount}
            />
          </Form.Group>

          <Button secondary>Search</Button>
        </Form>
      </Segment>

      {/* {results.map((post) => (
        <Post key={post._id} post={post} user={user}/>
      )
      )} */}

      {showToastr && <PostDeleteToastr />}

      {newMessageModal && newMessageReceived !== null && (
        <MessageNotificationModal
          socket={socket}
          showNewMessageModal={showNewMessageModal}
          newMessageModal={newMessageModal}
          newMessageReceived={newMessageReceived}
          user={user}
        />
      )}
      {results && resultsUsers && (
        <Segment color="blue">
          <InfiniteScroll
            hasMore={hasMore}
            next={fetchDataOnScroll}
            endMessage={<EndMessage />}
            dataLength={results.length}
          >
            {/* {results.map((post) => (
              <CardPost
                key={post._id}
                post={post}
                user={user.user}
                setPosts={setPosts}
                setShowToastr={setShowToastr}
              />
            ))} */}
            {results.map((post) =>
              resultsUsers.map((user) => (
                <ExtSearchCardPost
                  key={post._id}
                  post={post}
                  user={user}
                  setPosts={setPosts}
                  setShowToastr={setShowToastr}
                />
              ))
            )}
          </InfiniteScroll>
        </Segment>
      )}
    </>
  );
}

export default ExtSearch;
