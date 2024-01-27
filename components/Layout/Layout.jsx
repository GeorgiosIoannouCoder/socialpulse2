import React, { createRef } from "react";
import Router, { useRouter } from "next/router";
import {
  Container,
  Visibility,
  Grid,
  Sticky,
  Ref,
  Divider,
  Segment,
} from "semantic-ui-react";
import { createMedia } from "@artsy/fresnel";
import HeadTags from "./HeadTags";
import Navbar from "./Navbar";
import nprogress from "nprogress";
import SideMenu from "./SideMenu";
import Search from "./Search";
import MobileHeader from "./MobileHeader";

const AppMedia = createMedia({
  breakpoints: { zero: 0, smartphone: 541, tablet: 835, desktop: 1080 },
});
const mediaStyles = AppMedia.createMediaStyle();
const { Media, MediaContextProvider } = AppMedia;

function Layout({ children, user }) {
  const contextRef = createRef();
  const router = useRouter();
  const messagesRoute = router.pathname === "/messages";

  Router.onRouteChangeStart = () => nprogress.start();
  Router.onRouteChangeComplete = () => nprogress.done();
  Router.onRouteChangeError = () => nprogress.done();

  return (
    <>
      <HeadTags />
      {user ? (
        <>
          <style>{mediaStyles}</style>

          <MediaContextProvider>
            <div style={{ marginLeft: "1rem", marginRight: "1rem" }}>
              <Media greaterThanOrEqual="desktop">
                <Ref innerRef={contextRef}>
                  <Grid>
                    {!messagesRoute ? (
                      <>
                        <Grid.Column floated="left" width={2}>
                          <Sticky context={contextRef}>
                            <SideMenu user={user} pc />
                          </Sticky>
                        </Grid.Column>

                        <Grid.Column width={10}>
                          <Visibility context={contextRef}>
                            {children}
                          </Visibility>
                        </Grid.Column>

                        <Grid.Column floated="left" width={4}>
                          <Sticky context={contextRef}>
                            <Segment basic>
                              <Search />
                            </Segment>
                          </Sticky>
                        </Grid.Column>
                      </>
                    ) : (
                      <>
                        <Grid.Column floated="left" width={1} />
                        <Grid.Column width={15}>{children}</Grid.Column>
                      </>
                    )}
                  </Grid>
                </Ref>
              </Media>

              <Media between={["tablet", "desktop"]}>
                <Ref innerRef={contextRef}>
                  <Grid>
                    {!messagesRoute ? (
                      <>
                        <Grid.Column floated="left" width={1}>
                          <Sticky context={contextRef}>
                            <SideMenu user={user} pc={false} />
                          </Sticky>
                        </Grid.Column>

                        <Grid.Column width={15}>
                          <Visibility context={contextRef}>
                            {children}
                          </Visibility>
                        </Grid.Column>
                      </>
                    ) : (
                      <>
                        <Grid.Column floated="left" width={1} />
                        <Grid.Column width={15}>{children}</Grid.Column>
                      </>
                    )}
                  </Grid>
                </Ref>
              </Media>

              <Media between={["smartphone", "tablet"]}>
                <Ref innerRef={contextRef}>
                  <Grid>
                    {!messagesRoute ? (
                      <>
                        <Grid.Column floated="left" width={2}>
                          <Sticky context={contextRef}>
                            <SideMenu user={user} pc={false} />
                          </Sticky>
                        </Grid.Column>

                        <Grid.Column width={14}>
                          <Visibility context={contextRef}>
                            {children}
                          </Visibility>
                        </Grid.Column>
                      </>
                    ) : (
                      <>
                        <Grid.Column floated="left" width={1} />
                        <Grid.Column width={15}>{children}</Grid.Column>
                      </>
                    )}
                  </Grid>
                </Ref>
              </Media>

              <Media between={["zero", "smartphone"]}>
                <MobileHeader user={user} />
                <Grid>
                  <Grid.Column width={16}>{children}</Grid.Column>
                </Grid>
              </Media>
            </div>
          </MediaContextProvider>
        </>
      ) : (
        <>
          <Navbar />
          <Container text style={{ paddingTop: "1rem" }}>
            {children}
          </Container>
        </>
      )}
    </>
  );
}

export default Layout;
