import React, { useState } from "react";
import {
  Segment,
  Image,
  Grid,
  Divider,
  Header,
  Button,
  List,
  Modal,
  Icon,
  Form,
  TextArea,
  Label,
  Message,
  Popup,
} from "semantic-ui-react";
import {
  followUser,
  unfollowUser,
  reportProfile,
} from "../../utils/profileActions";
import {
  reportUser,
  unreportUser,
  resetreportUser,
  deleteUser,
} from "../../utils/userActions";

function ProfileHeader({
  profile,
  ownAccount,
  loggedUserFollowStats,
  setUserFollowStats,
  user,
  setShowToastr,
}) {
  const [loading, setLoading] = useState(false);
  const isFollowing =
    loggedUserFollowStats.following.length > 0 &&
    loggedUserFollowStats.following.filter(
      (following) => following.user === profile.user._id
    ).length > 0;
  const mailTo = "mailto:" + profile.user.email;
  const [text, setText] = useState("");
  const [reports, setReports] = useState(profile.reports);
  const [openReport, setOpenReport] = useState(false);
  const [openAddWarning, setOpenAddWarning] = useState(false);
  const [openRemoveWarning, setOpenRemoveWarning] = useState(false);
  const [openResetWarning, setOpenResetWarning] = useState(false);

  const userRole =
    "Role: " +
    profile.user.role.charAt(0).toUpperCase() +
    profile.user.role.slice(1);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await reportProfile(
      profile,
      user,
      text,
      setReports,
      setText,
      setError,
      setOpenReport
    );
    setLoading(false);
  };

  return (
    <>
      <Segment>
        <Grid stackable>
          <Grid.Column width={11}>
            <Grid.Row>
              <Header
                as="h2"
                content={profile.user.name}
                style={{
                  marginBottom: "-30px",
                }}
              />
              <Header
                as="h3"
                content={profile.user.username}
                style={{
                  fontFamily: "serif",
                  color: "#656D76 ",
                  marginBottom: "-20px",
                }}
              />
              <Header
                as="h4"
                content={userRole}
                style={{
                  marginBottom: "-23px",
                }}
              />
              {profile.user.role === "Trendy" && (
                <Icon
                  name="star"
                  color="yellow"
                  style={{
                    paddingLeft: "90px",
                    cursor: "pointer",
                  }}
                  size="large"
                />
              )}
            </Grid.Row>

            {profile.user.role === "Trendy" && (
              <Grid.Row
                stretched
                style={{
                  marginTop: "20px",
                }}
              >
                {profile.bio}
                <Divider hidden />
              </Grid.Row>
            )}
            {profile.user.role !== "Trendy" && (
              <Grid.Row
                stretched
                style={{
                  marginTop: "50px",
                }}
              >
                {profile.bio}
                <Divider hidden />
              </Grid.Row>
            )}
            <Grid.Row stretched>
              <List size="mini">
                <List.Item>
                  <List.Icon name="mail" />
                  <List.Content>
                    <a href={mailTo}>{profile.user.email}</a>
                  </List.Content>
                </List.Item>
              </List>
              {profile.social ? (
                <List size="mini">
                  {profile.social.facebook && (
                    <List.Item>
                      <List.Icon name="facebook" color="blue" />
                      <List.Content>
                        <a href={profile.social.facebook}>
                          {profile.social.facebook}
                        </a>
                      </List.Content>
                    </List.Item>
                  )}

                  {profile.social.instagram && (
                    <List.Item>
                      <List.Icon name="instagram" color="red" />
                      <List.Content>
                        <a href={profile.social.instagram}>
                          {profile.social.instagram}
                        </a>
                      </List.Content>
                    </List.Item>
                  )}

                  {profile.social.twitter && (
                    <List.Item>
                      <List.Icon name="twitter" color="blue" />
                      <List.Content>
                        <a href={profile.social.twitter}>
                          {profile.social.twitter}
                        </a>
                      </List.Content>
                    </List.Item>
                  )}

                  {profile.social.linkedin && (
                    <List.Item>
                      <List.Icon name="linkedin" color="blue" />
                      <List.Content>
                        <a href={profile.social.linkedin}>
                          {profile.social.linkedin}
                        </a>
                      </List.Content>
                    </List.Item>
                  )}

                  {profile.social.github && (
                    <List.Item>
                      <List.Icon name="github" color="black" />
                      <List.Content>
                        <a href={profile.social.github}>
                          {profile.social.github}
                        </a>
                      </List.Content>
                    </List.Item>
                  )}

                  {profile.social.youtube && (
                    <List.Item>
                      <List.Icon name="youtube" color="red" />
                      <List.Content>
                        <a href={profile.social.youtube}>
                          {profile.social.youtube}
                        </a>
                      </List.Content>
                    </List.Item>
                  )}
                </List>
              ) : (
                <> No Social Media Links </>
              )}
            </Grid.Row>
          </Grid.Column>

          <Grid.Column width={5} stretched style={{ textAlign: "center" }}>
            <Grid.Row>
              <Image size="large" avatar src={profile.user.profilePicUrl} />
            </Grid.Row>
            <br />

            {!ownAccount && (
              <Button
                compact
                loading={loading}
                disabled={loading}
                content={isFollowing ? "Following!" : "Follow?"}
                icon={isFollowing ? "check circle" : "add user"}
                color={isFollowing ? "instagram" : "twitter"}
                onClick={async () => {
                  setLoading(true);
                  isFollowing
                    ? await unfollowUser(profile.user._id, setUserFollowStats)
                    : await followUser(profile.user._id, setUserFollowStats);
                  setLoading(false);
                }}
              />
            )}
          </Grid.Column>
        </Grid>
        {/* report button for profile */}

        {profile.user.role !== "Super" && (
          <Modal
            closeIcon
            open={openReport}
            trigger={
              <Button
                as="div"
                labelPosition="right"
                style={{
                  marginTop: "20px",
                }}
              >
                <Button color="red">
                  <Icon
                    name="exclamation"
                    color="black"
                    style={{ cursor: "pointer" }}
                    fitted
                  />
                </Button>
                <Label as="a" basic color="red" pointing="left">
                  {profile.reports.length} Profile Reports
                </Label>
              </Button>
            }
            onClose={() => setOpenReport(false)}
            onOpen={() => setOpenReport(true)}
          >
            <Header icon="warning" content="Report Description" color="red" />
            <Modal.Content>
              <Form error={error !== null} onSubmit={handleSubmit}>
                <Message
                  error
                  onDismiss={() => setError(null)}
                  content={error}
                  header="Oh no!"
                />

                <Form.Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Please state your reasons for reporting this profile..."
                  action={{
                    color: "red",
                    icon: "checkmark",
                    loading: loading,
                    disabled: text === "" || loading,
                  }}
                />
              </Form>
            </Modal.Content>
          </Modal>
        )}

        {(user.role === "Super" || user._id === profile.user._id) && (
          <>
            <Popup
              on="click"
              position="top right"
              trigger={
                <Image
                  src="/deleteIcon.svg"
                  style={{ cursor: "pointer" }}
                  size="mini"
                  floated="right"
                />
              }
            >
              <Header as="h4" content="Are you sure?" />

              <p>This action is irreversible!</p>

              <Button
                color="red"
                icon="trash"
                content="Delete"
                onClick={() => {
                  deleteUser(profile.user._id, setShowToastr);

                  if (user.role === "Super") {
                    window.location.href = "/";
                  } else {
                    window.location.href = "/popular";
                  }
                }}
              />
            </Popup>
          </>
        )}
        <br />
        <br />
        {/* undo warning button for a user - only accessible for Super user */}
        {user.role === "Super" && user._id !== profile.user._id && (
          <Modal
            closeIcon
            open={openAddWarning}
            trigger={
              <Button as="div" labelPosition="right">
                <Button
                  color="youtube"
                  style={{
                    borderRadius: "30px",
                  }}
                >
                  <Icon
                    name="plus"
                    color="black"
                    style={{ cursor: "pointer" }}
                    fitted
                  />
                </Button>
              </Button>
            }
            onClose={() => setOpenAddWarning(false)}
            onOpen={() => setOpenAddWarning(true)}
          >
            <Header icon="plus" content="Add User Warning" color="red" />
            <Modal.Content>
              Are you sure you would like to add a warning for this user?
            </Modal.Content>

            <Modal.Actions>
              <Button color="red" onClick={() => setOpenAddWarning(false)}>
                <Icon name="remove" style={{ cursor: "pointer" }} fitted /> No
              </Button>
              <Button
                color="green"
                onClick={async () => {
                  setLoading(true);
                  await reportUser(profile.user._id);
                  setOpenAddWarning(false);
                  setLoading(false);
                }}
              >
                <Icon name="checkmark" style={{ cursor: "pointer" }} fitted />{" "}
                Yes
              </Button>
            </Modal.Actions>
          </Modal>
        )}
        {user.role === "Super" && user._id !== profile.user._id && (
          <Modal
            closeIcon
            open={openRemoveWarning}
            trigger={
              <Button as="div" labelPosition="right">
                <Button
                  color="green"
                  style={{
                    borderRadius: "30px",
                  }}
                >
                  <Icon
                    name="minus"
                    color="black"
                    style={{ cursor: "pointer" }}
                    fitted
                  />
                </Button>
              </Button>
            }
            onClose={() => setOpenRemoveWarning(false)}
            onOpen={() => setOpenRemoveWarning(true)}
          >
            <Header icon="minus" content="Remove User Warning" color="green" />
            <Modal.Content>
              Are you sure you would like to remove a warning for this user?
            </Modal.Content>

            <Modal.Actions>
              <Button color="red" onClick={() => setOpenRemoveWarning(false)}>
                <Icon name="remove" style={{ cursor: "pointer" }} /> No
              </Button>
              <Button
                color="green"
                onClick={async () => {
                  setLoading(true);
                  await unreportUser(profile.user._id);
                  setOpenRemoveWarning(false);
                  setLoading(false);
                }}
              >
                <Icon name="checkmark" style={{ cursor: "pointer" }} /> Yes
              </Button>
            </Modal.Actions>
          </Modal>
        )}

        {user.role === "Super" && user._id !== profile.user._id && (
          <Modal
            closeIcon
            open={openResetWarning}
            trigger={
              <Button as="div" labelPosition="right">
                <Button
                  color="orange"
                  style={{
                    borderRadius: "30px",
                  }}
                >
                  <Icon
                    name="undo"
                    color="black"
                    style={{ cursor: "pointer" }}
                    fitted
                  />
                </Button>
              </Button>
            }
            onClose={() => setOpenResetWarning(false)}
            onOpen={() => setOpenResetWarning(true)}
          >
            <Header icon="undo" content="Reset User Warnings" color="orange" />
            <Modal.Content>
              Are you sure you would like to reset the warnings for this user?
            </Modal.Content>

            <Modal.Actions>
              <Button color="red" onClick={() => setOpenResetWarning(false)}>
                <Icon name="remove" style={{ cursor: "pointer" }} /> No
              </Button>
              <Button
                color="green"
                onClick={async () => {
                  setLoading(true);
                  await resetreportUser(profile.user._id);
                  setOpenResetWarning(false);
                  setLoading(false);
                }}
              >
                <Icon name="checkmark" style={{ cursor: "pointer" }} /> Yes
              </Button>
            </Modal.Actions>
          </Modal>
        )}
      </Segment>
    </>
  );
}

export default ProfileHeader;
