import { Message, Button } from "semantic-ui-react";

export const NoProfilePosts = () => (
  <>
    <Message
      info
      icon="thumbs down"
      header="No Posts?"
      content="User has not posted anything yet!"
    />
    <Button
      icon="long arrow alternate left"
      content="Go Post"
      as="a"
      href="/"
    />
  </>
);

export const NoFollowData = ({ followersComponent, followingComponent }) => (
  <>
    {followersComponent && (
      <Message
        icon="user outline"
        info
        content={`User does not have connections!`}
      />
    )}

    {followingComponent && (
      <Message
        icon="user outline"
        info
        content={`User has not been following  any user!`}
      />
    )}
  </>
);

export const NoMessages = () => (
  <Message
    info
    icon="talk"
    header="No Messages?"
    content="You have not messaged anyone yet. Search above to message someone!"
  />
);

export const NoPosts = () => (
  <Message
    info
    icon="thumbs down"
    header="Hey!"
    content="No Posts. Make sure you have followed someone."
  />
);

export const NoPostFound = () => (
  <Message
    info
    icon="thumbs down"
    header="Hey!"
    content="No Posts To Display!"
  />
);

export const NoProfile = () => (
  <Message info icon="meh" header="Hey!" content="No Profile Found." />
);

export const NoNotifications = () => (
  <Message
    info
    icon="thumbs up"
    content="No Notifications! You are good to Go!"
  />
);
export const NoTrendyPosts = () => (
  <Message
    info
    icon="thumbs down"
    header="Hey!"
    content="No Popular Posts! SignUp to be the Write One!"
  />
);
