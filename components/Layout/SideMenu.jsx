import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { List, Icon, Radio } from "semantic-ui-react";
import { logoutUser } from "../../utils/authUser";

function SideMenu({
  user: { unreadNotification, email, unreadMessage, username },
  pc = true,
}) {
  const router = useRouter();
  const isActive = (route) => router.pathname === route;
  const [dark, setDark] = useState(false);

  const toggleDarkMode = () => {
    const body = document.body;
    if (dark) {
      setDark(false);
    } else {
      setDark(true);
    }
    if (dark) {
      body.style.backgroundColor = "#23272f";
      body.style.color = "#23272f";
    } else {
      body.style.backgroundColor = "#808080";
      body.style.color = "#23272f";
    }
  };

  return (
    <>
      <List
        style={{ paddingTop: "1rem" }}
        size="big"
        verticalAlign="middle"
        selection
        inverted
      >
        <Link href="/">
          <List.Item active={isActive("/")}>
            {dark ? (
              <Icon
                fitted
                name="home"
                size="large"
                {...(isActive("/") && { color: "blue" })}
                style={{ color: "#23272f" }}
              />
            ) : (
              <Icon
                fitted
                name="home"
                size="large"
                {...(isActive("/") && { color: "blue" })}
                style={{ color: "#ececec" }}
              />
            )}
            <List.Content>
              {pc && dark ? (
                <List.Header content="Home" style={{ color: "#23272f" }} />
              ) : (
                <List.Header content="Home" style={{ color: "#ececec" }} />
              )}
            </List.Content>
          </List.Item>
        </Link>
        <br />
        <Link href="/trendy">
          <List.Item active={isActive("/trendy")}>
            {dark ? (
              <Icon
                name="star"
                size="large"
                {...(isActive("/trendy") && { color: "blue" })}
                style={{ color: "#23272f" }}
              />
            ) : (
              <Icon
                name="star"
                size="large"
                {...(isActive("/trendy") && { color: "blue" })}
                style={{ color: "#ececec" }}
              />
            )}
            <List.Content>
              {pc && dark ? (
                <List.Header content="Trendy" style={{ color: "#23272f" }} />
              ) : (
                <List.Header content="Trendy" style={{ color: "#ececec" }} />
              )}
            </List.Content>
          </List.Item>
        </Link>
        <br />
        <Link href="/extsearch">
          <List.Item active={isActive("/extsearch")}>
            {dark ? (
              <Icon
                name="search"
                size="large"
                {...(isActive("/extsearch") && { color: "blue" })}
                style={{ color: "#23272f" }}
              />
            ) : (
              <Icon
                name="search"
                size="large"
                {...(isActive("/extsearch") && { color: "blue" })}
                style={{ color: "#ececec" }}
              />
            )}
            <List.Content>
              {pc && dark ? (
                <List.Header content="Search" style={{ color: "#23272f" }} />
              ) : (
                <List.Header content="Search" style={{ color: "#ececec" }} />
              )}
            </List.Content>
          </List.Item>
        </Link>
        <br />
        <Link href="/messages">
          <List.Item active={isActive("/messages")}>
            {dark ? (
              <Icon
                fitted
                name={unreadMessage ? "hand point right" : "mail outline"}
                size="large"
                {...((isActive("/messages") && { color: "blue" }) ||
                  (unreadMessage && { color: "green" }))}
                style={{ color: "#23272f" }}
              />
            ) : (
              <Icon
                fitted
                name={unreadMessage ? "hand point right" : "mail outline"}
                size="large"
                {...((isActive("/messages") && { color: "blue" }) ||
                  (unreadMessage && { color: "green" }))}
                style={{ color: "#ececec" }}
              />
            )}
            <List.Content>
              {pc && dark ? (
                <List.Header content="Messages" style={{ color: "#23272f" }} />
              ) : (
                <List.Header content="Messages" style={{ color: "#ececec" }} />
              )}
            </List.Content>
          </List.Item>
        </Link>
        <br />
        <Link href="/notifications">
          <List.Item active={isActive("/notifications")}>
            {dark ? (
              <Icon
                fitted
                name={unreadNotification ? "hand point right" : "bell outline"}
                size="large"
                {...((isActive("/notifications") && { color: "blue" }) ||
                  (unreadNotification && { color: "green" }))}
                style={{ color: "#23272f" }}
              />
            ) : (
              <Icon
                fitted
                name={unreadNotification ? "hand point right" : "bell outline"}
                size="large"
                {...((isActive("/notifications") && { color: "blue" }) ||
                  (unreadNotification && { color: "green" }))}
                style={{ color: "#ececec" }}
              />
            )}
            <List.Content>
              {pc && dark ? (
                <List.Header
                  content="Notifications"
                  style={{ color: "#23272f" }}
                />
              ) : (
                <List.Header
                  content="Notifications"
                  style={{ color: "#ececec" }}
                />
              )}
            </List.Content>
          </List.Item>
        </Link>
        <br />
        <Link href={`/${username}`}>
          <List.Item active={router.query.username === username}>
            {dark ? (
              <Icon
                fitted
                name="user"
                size="large"
                {...(router.query.username === username && { color: "blue" })}
                style={{ color: "#23272f" }}
              />
            ) : (
              <Icon
                fitted
                name="user"
                size="large"
                {...(router.query.username === username && { color: "blue" })}
                style={{ color: "#ececec" }}
              />
            )}

            <List.Content>
              {pc && dark ? (
                <List.Header content="Account" style={{ color: "#23272f" }} />
              ) : (
                <List.Header content="Account" style={{ color: "#ececec" }} />
              )}
            </List.Content>
          </List.Item>
        </Link>
        <br />
        <List.Item onClick={() => logoutUser(email)}>
          {dark ? (
            <Icon name="log out" size="large" style={{ color: "#23272f" }} />
          ) : (
            <Icon name="log out" size="large" style={{ color: "#ececec" }} />
          )}
          <List.Content>
            {pc && dark ? (
              <List.Header content="Logout" style={{ color: "#23272f" }} />
            ) : (
              <List.Header content="Logout" style={{ color: "#ececec" }} />
            )}
          </List.Content>
        </List.Item>
        <List.Item onClick={toggleDarkMode} style={{ marginTop: "10px" }}>
          {dark ? (
            <Icon name="sun" size="large" style={{ color: "#23272f" }} />
          ) : (
            <Icon name="moon" size="large" style={{ color: "#ececec" }} />
          )}
        </List.Item>
      </List>
    </>
  );
}

export default SideMenu;
