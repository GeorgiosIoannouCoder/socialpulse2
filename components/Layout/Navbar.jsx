import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Menu, Container, Icon } from "semantic-ui-react";

function Navbar() {
  const router = useRouter();
  const isActive = (route) => router.pathname === route;

  return (
    <Menu fluid borderless inverted>
      <Container text>
        <Link href="/popular">
          <Menu.Item header active={isActive("/popular")}>
            {router.pathname === "/popular" ? (
              <Icon size="large" name="star" color="yellow" />
            ) : (
              <Icon size="large" name="star" />
            )}
            Popular
          </Menu.Item>
        </Link>

        <Link href="/login">
          <Menu.Item header active={isActive("/login")}>
            {router.pathname === "/login" ? (
              <Icon size="large" name="sign in" color="blue" />
            ) : (
              <Icon size="large" name="sign in" />
            )}
            Login
          </Menu.Item>
        </Link>

        <Link href="/signup">
          <Menu.Item header active={isActive("/signup")}>
            {router.pathname === "/signup" ? (
              <Icon size="large" name="signup" color="green" />
            ) : (
              <Icon size="large" name="signup" />
            )}
            SignUp
          </Menu.Item>
        </Link>
      </Container>
    </Menu>
  );
}

export default Navbar;
