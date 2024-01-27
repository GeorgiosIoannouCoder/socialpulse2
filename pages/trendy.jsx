import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import cookie from "js-cookie";
import { parseCookies } from "nookies";
import InfiniteScroll from "react-infinite-scroll-component";
import { Segment, Button, Card, Image } from "semantic-ui-react";
import baseUrl from "../utils/baseUrl";
import CardPost from "../components/Post/CardPost";
import { NoPosts } from "../components/Layout/NoData";
import {
  PlaceHolderPosts,
  EndMessage,
} from "../components/Layout/PlaceHolderGroup";
import getUserInfo from "../utils/getUserInfo";
import { followUser } from "../utils/profileActions";

function Trendy({ user, postsData, errorLoading }) {
  const [posts, setPosts] = useState(postsData || []);
  const [showToastr, setShowToastr] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isVisible, setIsVisible] = useState({
    card1: true,
    card2: true,
    card3: true,
  });
  const [pageNumber, setPageNumber] = useState(2);
  const socket = useRef();

  // variables for first not followed trendy user
  const [bio, setBio] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [id, setId] = useState("");

  // variables for second not followed trendy user
  const [bio1, setBio1] = useState("");
  const [profilePicUrl1, setProfilePicUrl1] = useState("");
  const [name1, setName1] = useState("");
  const [username1, setUsername1] = useState("");
  const [role1, setRole1] = useState("");
  const [id1, setId1] = useState("");

  // variables for third not followed trendy user
  const [bio2, setBio2] = useState("");
  const [profilePicUrl2, setProfilePicUrl2] = useState("");
  const [name2, setName2] = useState("");
  const [username2, setUsername2] = useState("");
  const [role2, setRole2] = useState("");
  const [id2, setId2] = useState("");

  // variables to follow user
  const [userFollowStats, setUserFollowStats] = useState({
    followers: [], // Initialize with the existing followers array
    following: [], // Initialize with the existing following array
  });

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

    document.title = `Welcome, ${user.name.split(" ")[0]}. Let's Connect!`;
  }, []);

  useEffect(() => {
    showToastr && setTimeout(() => setShowToastr(false), 3000);
  }, [showToastr]);

  const fetchDataOnScroll = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/trendy`, {
        //changed from /api/posts to /api/trendy
        headers: { Authorization: cookie.get("token") },
        params: { pageNumber },
      });

      if (res.data.length === 0) setHasMore(false);

      setPosts((prev) => [...prev, ...res.data]);
      setPageNumber((prev) => prev + 1);
    } catch (error) {
      alert("Error fetching Posts!");
    }
  };

  const handleFollow = async (userToFollowId, cardNumber) => {
    try {
      await followUser(userToFollowId, setUserFollowStats);
      setIsVisible((prev) => ({
        ...prev,
        [cardNumber]: false,
      }));
      // Optionally, you can update the state or perform any other actions after following
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  // function to dismiss the 1st not followed trendy user
  const handleDismiss = (cardNumber) => {
    setIsVisible((prev) => ({
      ...prev,
      [cardNumber]: false,
    }));
  };

  useEffect(() => {
    const getBio = async () => {
      try {
        //setLoading(true);
        const res = await axios.get(
          `${baseUrl}/api/profile/trendy/${user.username}`,
          {
            headers: { Authorization: cookie.get("token") },
          }
        );

        // first not-followed trendy user info
        setBio(res.data.trendyProfiles[0].user.bio);
        setProfilePicUrl(res.data.trendyProfiles[0].user.profilePicUrl);
        setName(res.data.trendyProfiles[0].user.name);
        setUsername(res.data.trendyProfiles[0].user.username);
        setRole(res.data.trendyProfiles[0].user.role);
        setId(res.data.trendyProfiles[0].user._id);

        // second not-followed trendy user info
        setBio1(res.data.trendyProfiles[1].user.bio);
        setProfilePicUrl1(res.data.trendyProfiles[1].user.profilePicUrl);
        setName1(res.data.trendyProfiles[1].user.name);
        setUsername1(res.data.trendyProfiles[1].user.username);
        setRole1(res.data.trendyProfiles[1].user.role);
        setId1(res.data.trendyProfiles[1].user._id);

        // third not-followed trendy user info
        setBio2(res.data.trendyProfiles[2].user.bio);
        setProfilePicUrl2(res.data.trendyProfiles[2].user.profilePicUrl);
        setName2(res.data.trendyProfiles[2].user.name);
        setUsername2(res.data.trendyProfiles[2].user.username);
        setRole2(res.data.trendyProfiles[2].user.role);
        setId2(res.data.trendyProfiles[2].user._id);
      } catch (error) {}
      //setLoading(false);
    };
    getBio();
  }, []);

  if (!isVisible) {
    return (
      <div>
        <Segment color="blue">
          {/* Placeholder for when the card is not visible */}
          {posts.length === 0 || errorLoading ? (
            <NoPosts />
          ) : (
            <InfiniteScroll
              hasMore={hasMore}
              next={fetchDataOnScroll}
              loader={<PlaceHolderPosts />}
              endMessage={<EndMessage />}
              dataLength={posts.length}
            >
              {posts.map((post) => (
                <CardPost
                  key={post._id}
                  post={post}
                  bio={bio}
                  user={user}
                  setPosts={setPosts}
                  setShowToastr={setShowToastr}
                />
              ))}
            </InfiniteScroll>
          )}
        </Segment>
      </div>
    );
  } else {
    // If isVisible is true, display the Card.Group for individual posts
    return (
      <>
        <Card.Group>
          {/* displaying the first trendy user that this user does not follow */}
          {isVisible.card1 && (
            <Card style={{ width: "19rem" }}>
              <Card.Content>
                <Image floated="right" size="mini" src={profilePicUrl} />
                <Card.Header>{name}</Card.Header>
                <Card.Meta>
                  <strong>@{username}</strong>
                </Card.Meta>
                <Card.Meta>{role} user</Card.Meta>
                <Card.Description>{bio}</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <div className="ui two buttons">
                  <Button
                    basic
                    color="green"
                    onClick={() => handleFollow(id, "card1")}
                  >
                    Follow
                  </Button>
                  <Button
                    basic
                    color="red"
                    onClick={() => handleDismiss("card1")}
                  >
                    Dismiss
                  </Button>
                </div>
              </Card.Content>
            </Card>
          )}
          {/* displaying the second trendy user that this user does not follow */}
          {isVisible.card2 && (
            <Card style={{ width: "19rem" }}>
              <Card.Content>
                <Image floated="right" size="mini" src={profilePicUrl1} />
                <Card.Header>{name1}</Card.Header>
                <Card.Meta>
                  <strong>@{username1}</strong>
                </Card.Meta>
                <Card.Meta>{role1} user</Card.Meta>
                <Card.Description>{bio1}</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <div className="ui two buttons">
                  <Button
                    basic
                    color="green"
                    onClick={() => handleFollow(id1, "card2")}
                  >
                    Follow
                  </Button>
                  <Button
                    basic
                    color="red"
                    onClick={() => handleDismiss("card2")}
                  >
                    Dismiss
                  </Button>
                </div>
              </Card.Content>
            </Card>
          )}

          {/* displaying the third trendy user that this user does not follow */}
          {isVisible.card3 && (
            <Card style={{ width: "19rem" }}>
              <Card.Content>
                <Image floated="right" size="mini" src={profilePicUrl2} />
                <Card.Header>{name2}</Card.Header>
                <Card.Meta>
                  <strong>@{username2}</strong>
                </Card.Meta>
                <Card.Meta>{role2} user</Card.Meta>
                <Card.Description>{bio2}</Card.Description>
              </Card.Content>
              <Card.Content extra>
                <div className="ui two buttons">
                  <Button
                    basic
                    color="green"
                    onClick={() => handleFollow(id2, "card3")}
                  >
                    Follow
                  </Button>
                  <Button
                    basic
                    color="red"
                    onClick={() => handleDismiss("card3")}
                  >
                    Dismiss
                  </Button>
                </div>
              </Card.Content>
            </Card>
          )}
        </Card.Group>

        <Segment color="blue">
          {/* Placeholder for displaying posts */}
          {posts.length === 0 || errorLoading ? (
            <NoPosts />
          ) : (
            <Segment // <InfiniteScroll
              hasMore={hasMore}
              next={fetchDataOnScroll}
              loader={<PlaceHolderPosts />}
              endMessage={<EndMessage />}
              dataLength={posts.length}
            >
              {posts.map((post) => (
                <CardPost
                  key={post._id}
                  post={post}
                  user={user}
                  setPosts={setPosts}
                  setShowToastr={setShowToastr}
                />
              ))}
            </Segment> //</InfiniteScroll>
          )}
        </Segment>
      </>
    );
  }
}

Trendy.getInitialProps = async (ctx) => {
  try {
    const { token } = parseCookies(ctx);
    const res = await axios.get(`${baseUrl}/api/trendy`, {
      // from /api/posts to /api/trnedy
      headers: { Authorization: token },
      params: { pageNumber: 1 },
    });

    return { postsData: res.data };
  } catch (error) {
    return { errorLoading: true };
  }
};

export default Trendy;
