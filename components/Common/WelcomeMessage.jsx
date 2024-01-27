import { Icon, Message, Divider } from "semantic-ui-react";
import { useRouter } from "next/router";
import Link from "next/link";

export const TrendyHeaderMessage = () => {
  return (
    <>
      <Message
        attached="bottom"
        style={{
          backgroundColor: "#0f3368",
          color: "#ffffff",
          fontSize: "15px",
        }}
      >
        <Icon name="heart" color="violet" size="large" />
        Welcome to SocialPulse!<Link href="/signup"> SignUp</Link> Here!
      </Message>
      <Divider hidden />

      <Message
        attached="bottom"
        style={{
          marginTop: "-20px",
          backgroundColor: "#0f3368",
          color: "#ffffff",
          fontSize: "15px",
        }}
      >
        <Icon name="help" color="red" size="large" />
        Existing User? <Link href="/login">Login</Link> Here!{" "}
      </Message>
    </>
  );
};

export const HeaderMessage = () => {
  const router = useRouter();
  const signupRoute = router.pathname === "/signup";
  return (
    <Message
      color="blue"
      attached
      header={signupRoute ? "Get Connected!" : "Glad that you are back!"}
      icon={signupRoute ? "user plus" : "thumbs up"}
      content={
        signupRoute ? "Create New Account" : "Login with Email and Password"
      }
    />
  );
};

export const FooterMessage = () => {
  const router = useRouter();
  const signupRoute = router.pathname === "/signup";

  return (
    <>
      {signupRoute ? (
        <>
          <Message
            attached="bottom"
            style={{ backgroundColor: "#0f3368", color: "#ffffff" }}
          >
            <Icon name="help" color="red" />
            Existing User? <Link href="/login">Login</Link> Here!{" "}
          </Message>
          <Divider hidden />
        </>
      ) : (
        <>
          <Message attached="bottom" color="red">
            <Icon name="lock" />
            <Link href="/reset">Forgot Password?</Link>
          </Message>

          <Message
            attached="bottom"
            style={{ backgroundColor: "#0f3368", color: "#ffffff" }}
          >
            <Icon name="help" color="red" />
            New User? <Link href="/signup">SignUp</Link> Here!{" "}
          </Message>
        </>
      )}
    </>
  );
};
