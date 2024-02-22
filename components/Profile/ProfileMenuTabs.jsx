import React from "react";
import { Menu, Container } from "semantic-ui-react";

function ProfileMenuTabs({
  user,
  activeItem,
  handleItemClick,
  followersLength,
  followingLength,
  ownAccount,
  loggedUserFollowStats,
}) {
  return (
    <>
      <Menu pointing secondary inverted stackable>
        <Container text>
          <Menu.Item
            name="profile"
            active={activeItem === "profile"}
            onClick={() => handleItemClick("profile")}
          />
          <Menu.Item
            name={`${followersLength} followers`}
            active={activeItem === "followers"}
            onClick={() => handleItemClick("followers")}
          />
          {ownAccount && user.role !== "Super" && (
            <>
              <Menu.Item
                name={`${
                  loggedUserFollowStats.following.length > 0
                    ? loggedUserFollowStats.following.length
                    : 0
                } following`}
                active={activeItem === "following"}
                onClick={() => handleItemClick("following")}
              />

              <Menu.Item
                name="Update Profile"
                active={activeItem === "updateProfile"}
                onClick={() => handleItemClick("updateProfile")}
              />

              <Menu.Item
                name="settings"
                active={activeItem === "settings"}
                onClick={() => handleItemClick("settings")}
              />

              <Menu.Item
                name="warnings"
                active={activeItem === "warnings"}
                onClick={() => handleItemClick("warnings")}
              />
            </>
          )}
          {ownAccount && user.role === "Super" && (
            <>
              <Menu.Item
                name={`${
                  loggedUserFollowStats.following.length > 0
                    ? loggedUserFollowStats.following.length
                    : 0
                } following`}
                active={activeItem === "following"}
                onClick={() => handleItemClick("following")}
              />

              <Menu.Item
                name="Update Profile"
                active={activeItem === "updateProfile"}
                onClick={() => handleItemClick("updateProfile")}
              />

              <Menu.Item
                name="settings"
                active={activeItem === "settings"}
                onClick={() => handleItemClick("settings")}
              />
            </>
          )}

          {!ownAccount && (
            <Menu.Item
              name={`${followingLength} following`}
              active={activeItem === "following"}
              onClick={() => handleItemClick("following")}
            />
          )}

          {!ownAccount && user.role === "Super" && (
            <Menu.Item
              name="warnings"
              active={activeItem === "warnings"}
              onClick={() => handleItemClick("warnings")}
            />
          )}
        </Container>
      </Menu>
    </>
  );
}

export default ProfileMenuTabs;
