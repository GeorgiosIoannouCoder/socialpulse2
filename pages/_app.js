import App from "next/app";
import axios from "axios";
import { parseCookies, destroyCookie } from "nookies";
import "react-toastify/dist/ReactToastify.css";
import "semantic-ui-css/semantic.min.css";
import "cropperjs/dist/cropper.css";
import baseUrl from "../utils/baseUrl";
import { redirectUser } from "../utils/authUser";
import Layout from "../components/Layout/Layout";
import "../public/styles.css";

class MyApp extends App {
  static async getInitialProps({ Component, ctx }) {
    const { token } = parseCookies(ctx);
    let pageProps = {};

    // Protected Routes not accessible to the user if not logged in.
    const protectedRoutes =
      ctx.pathname === "/" ||
      ctx.pathname == "/trendy" ||
      ctx.pathname === "/[username]" ||
      ctx.pathname === "/notifications" ||
      ctx.pathname === "/post/[postId]" ||
      ctx.pathname === "/messages" ||
      ctx.pathname === "/search" ||
      ctx.pathname === "/extsearch";

    if (!token) {
      protectedRoutes && redirectUser(ctx, "/popular");
    } else {
      if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx);
      }

      try {
        const res = await axios.get(`${baseUrl}/api/auth`, {
          headers: { Authorization: token },
        });
        const { user, userFollowStats } = res.data;

        if (user) {
          !protectedRoutes && redirectUser(ctx, "/");
        }

        pageProps.user = user;
        pageProps.userFollowStats = userFollowStats;
      } catch (error) {
        destroyCookie(ctx, "token");
        redirectUser(ctx, "/popular");
      }
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Layout {...pageProps}>
        <Component {...pageProps} />
      </Layout>
    );
  }
}

export default MyApp;
