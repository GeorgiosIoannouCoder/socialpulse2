import React, { useState, useEffect } from "react";
import axios from "axios";
import cookie from "js-cookie";
import { Button, Image, List } from "semantic-ui-react";
import baseUrl from "../../utils/baseUrl";
import Spinner from "../Layout/Spinner";
import { NoFollowData } from "../Layout/NoData";
import { followUser, unfollowUser } from "../../utils/profileActions";

const Named = ({
  user,
  loggedUserFollowStats,
  setUserFollowStats,
  profileUserId,
}) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const getFollowing = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${baseUrl}/api/profile/following/${profileUserId}`,
          {
            headers: { Authorization: cookie.get("token") },
          }
        );

        setFollowing(res.data);
      } catch (error) {
        alert("Error Loading Connections!");
      }
      setLoading(false);
    };

    getFollowing();
  }, []);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : following.length > 0 ? (
        following.map((profileFollowing) => {
          const isFollowing =
            loggedUserFollowStats.following.length > 0 &&
            loggedUserFollowStats.following.filter(
              (following) => following.user === profileFollowing.user._id
            ).length > 0;

          return (
            <List
              key={profileFollowing.user._id}
              divided
              verticalAlign="middle"
              inverted
            >
              <List.Item>
                <List.Content floated="right">
                  {profileFollowing.user._id !== user._id && (
                    <Button
                      color={isFollowing ? "blue" : "red"}
                      icon={isFollowing ? "check" : "add user"}
                      content={isFollowing ? "Following!" : "Follow?"}
                      disabled={followLoading}
                      onClick={() => {
                        setFollowLoading(true);

                        isFollowing
                          ? unfollowUser(
                              profileFollowing.user._id,
                              setUserFollowStats
                            )
                          : followUser(
                              profileFollowing.user._id,
                              setUserFollowStats
                            );

                        setFollowLoading(false);
                      }}
                    />
                  )}
                </List.Content>
                <Image avatar src={profileFollowing.user.profilePicUrl} />
                <List.Content
                  as="a"
                  href={`/${profileFollowing.user.username}`}
                >
                  {profileFollowing.user.name}
                </List.Content>
              </List.Item>
            </List>
          );
        })
      ) : (
        <NoFollowData followingComponent={true} />
      )}
    </>
  );
};

export default Named;
