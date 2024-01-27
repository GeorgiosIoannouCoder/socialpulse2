import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  Icon,
  Image,
  Divider,
  Segment,
  Button,
  Header,
  Modal,
  Label,
  Form,
  Message,
  Embed,
} from "semantic-ui-react";
import PopularPostComments from "./PopularPostComments";
import calculateTime from "../../utils/calculateTime";
import { reportPostSurfer } from "../../utils/postSurferActions";
import ReadsList from "./ReadsList";
import PopularImageModal from "./PopularImageModal";
import PopularNoImageModal from "./PopularNoImageModal";

function PopularCardPost({ post, setPosts }) {
  const [likes, setLikes] = useState(post.likes);
  const [dislikes, setDisLikes] = useState(post.dislikes);
  const [reads, setReads] = useState(post.reads);
  const [isRead, setIsRead] = useState(false);
  const [comments, setComments] = useState(post.comments);
  const [reports, setReports] = useState(post.reports);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const addPropsToModal = () => ({
    post,
    setReads,
    setLikes,
    setDisLikes,
    reads,
    likes,
    dislikes,
    setPosts,
    comments,
    setComments,
    reports,
    setReports,
  });

  const [openReport, setOpenReport] = useState(false);

  // function to handle when a user clicks the "Read" button
  const readPostOnClick = () => {
    setShowFullText(!showFullText);
    setIsRead(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await reportPostSurfer(
      post,
      text,
      setReports,
      setText,
      setError,
      setOpenReport
    );
    setLoading(false);
  };

  let isvideo = false;
  if (post.picUrl) {
    isvideo = post.picUrl.endsWith(".mp4");
  }

  const [showFullText, setShowFullText] = useState(false);

  return (
    <>
      {showModal && (
        <Modal
          open={showModal}
          closeIcon
          closeOnDimmerClick
          onClose={() => setShowModal(false)}
        >
          <Modal.Content>
            {post.picUrl ? (
              <PopularImageModal {...addPropsToModal()} />
            ) : (
              <PopularNoImageModal {...addPropsToModal()} />
            )}
          </Modal.Content>
        </Modal>
      )}

      <Segment basic>
        <Card color="black" fluid>
          {post.picUrl && !isvideo && (
            <Image
              src={post.picUrl}
              style={{ cursor: "pointer" }}
              floated="left"
              wrapped
              ui={false}
              alt="PostImage"
              onClick={() => setShowModal(true)}
            />
          )}
          {post.picUrl && isvideo && <Embed url={post.picUrl} />}

          <Card.Content>
            <Image
              floated="left"
              src={post.user.profilePicUrl}
              avatar
              circular
            />

            <Card.Header>
              <Link href={`/login`}>
                <a>
                  {post.user.name} | {post.user.role.charAt(0).toUpperCase()}
                  {post.user.role.slice(1)}
                </a>
              </Link>
            </Card.Header>

            <Card.Meta>
              {post.kind === "Trendy" && <Icon name="star" color="yellow" />}
              {post.type} Post @ {calculateTime(post.createdAt)}
            </Card.Meta>

            <Card.Meta
              content={[post.company, post.location].filter(Boolean).join(", ")}
            />

            <b>
              <Card.Meta
                content={post.keywords
                  .slice(0, 3)
                  .map((keyword) => "@" + keyword)
                  .join(", ")}
              />
            </b>

            <Card.Description
              style={{
                fontSize: showFullText ? "20px" : "10px",
                color: showFullText ? "#23272f" : "transparent",
                overflow: "hidden",
                marginTop: "10px",
                textShadow: showFullText ? "" : "0 0 8px #000",
              }}
              onCopy={(e) => e.preventDefault()}
            >
              {post.text}
            </Card.Description>

            {/* Read Button */}
            <Button
              as="div"
              labelPosition="right"
              style={{ marginTop: "20px" }}
              floated="right"
            >
              <Button color="black" onClick={readPostOnClick} disabled={isRead}>
                <Icon
                  name={isRead ? "eye slash" : "eye"}
                  style={{ cursor: "pointer" }}
                  color="green"
                  size="large"
                  fitted
                />
              </Button>
              <Label as="a" color="black">
                {reads.length > 0 && (
                  <span className="spanReadsList">
                    {`${reads.length} ${reads.length === 1 ? "read" : "reads"}`}
                  </span>
                )}
              </Label>
            </Button>
          </Card.Content>

          <Card.Content extra>
            <div>
              {/* Like Button */}
              <Button as="div" labelPosition="right">
                <Link href={`/login`}>
                  <Button color="blue">
                    <Icon
                      name={"thumbs up"}
                      style={{ cursor: "pointer" }}
                      fitted
                    />
                  </Button>
                </Link>
                <Label as="a" basic color="blue" pointing="left">
                  {likes.length > 0 && (
                    <span className="spanLikesList">
                      {`${likes.length} ${
                        likes.length === 1 ? "like" : "likes"
                      }`}
                    </span>
                  )}
                </Label>
              </Button>

              {/* Dislike Button */}
              <Button as="div" labelPosition="right">
                <Link href={`/login`}>
                  <Button color="brown">
                    <Icon
                      name={"thumbs down"}
                      style={{ cursor: "pointer" }}
                      fitted
                    />
                  </Button>
                </Link>
                <Label as="a" basic color="brown" pointing="left">
                  {dislikes.length > 0 && (
                    <span className="spanDisLikesList">
                      {`${dislikes.length} ${
                        dislikes.length === 1 ? "dislike" : "dislikes"
                      }`}
                    </span>
                  )}
                </Label>
              </Button>

              {/* Comment Button */}
              <Button as="div" labelPosition="right">
                <Link href={`/login`}>
                  <Button color="violet">
                    <Icon name="comment outline" />
                  </Button>
                </Link>
                <Label as="a" basic color="violet" pointing="left">
                  {comments.length > 0 && (
                    <span>
                      {`${comments.length} ${
                        comments.length === 1 ? "comment" : "comments"
                      }`}
                    </span>
                  )}
                </Label>
              </Button>

              {/* Report Button */}
              {reports.length > 0 && post.user.role !== "Super" && (
                <Modal
                  closeIcon
                  open={openReport}
                  trigger={
                    <Button as="div" labelPosition="right" floated="right">
                      <Button color="red" style={{ borderRadius: "30px" }}>
                        <Icon
                          name="exclamation"
                          color="black"
                          style={{ cursor: "pointer" }}
                          fitted
                        />
                      </Button>
                    </Button>
                  }
                  onClose={() => setOpenReport(false)}
                  onOpen={() => setOpenReport(true)}
                >
                  <Label
                    as="a"
                    basic
                    style={{
                      borderBottomLeftRadius: "30px",
                      borderBottomRightRadius: "30px",
                      marginTop: "5px",
                      fontSize: "15px",
                      backgroundColor: "#de272d",
                      color: "white",
                    }}
                  >
                    {reports.length > 0 && (
                      <span className="spanReportPostList">
                        {`${reports.length} ${
                          reports.length === 1 ? "report" : "reports"
                        }`}
                      </span>
                    )}
                  </Label>
                  <Header
                    icon="warning"
                    content="Report Description"
                    color="red"
                  />
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
                        placeholder="Please state your reasons for reporting this post..."
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

              {reports.length === 0 && post.user.role !== "Super" && (
                <Modal
                  closeIcon
                  open={openReport}
                  trigger={
                    <Button as="div" labelPosition="right" floated="right">
                      <Button
                        color="red"
                        style={{
                          borderRadius: "30px",
                        }}
                      >
                        <Icon
                          name="exclamation"
                          color="black"
                          style={{ cursor: "pointer" }}
                          fitted
                        />
                      </Button>
                    </Button>
                  }
                  onClose={() => setOpenReport(false)}
                  onOpen={() => setOpenReport(true)}
                >
                  <Header
                    icon="warning"
                    content="Report Description"
                    color="red"
                  />
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
                        placeholder="Please state your reasons for reporting this post..."
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
              {/* Tip Button */}
              <Button as="div" labelPosition="right">
                <Link href={`/login`}>
                  <Button color="green">
                    <Icon
                      name="dollar sign"
                      style={{ cursor: "pointer" }}
                      fitted
                    />
                  </Button>
                </Link>
              </Button>
            </div>

            {/* Comment Button */}
            {comments.length > 0 &&
              comments.map(
                (comment, i) =>
                  i < 3 && (
                    <PopularPostComments
                      key={comment._id}
                      comment={comment}
                      postId={post._id}
                      setComments={setComments}
                    />
                  )
              )}

            {comments.length > 3 && (
              <Button
                content="View More"
                color="blue"
                basic
                circular
                onClick={() => setShowModal(true)}
              />
            )}

            <Divider hidden />
          </Card.Content>
        </Card>
      </Segment>
      <Divider hidden />
    </>
  );
}

export default PopularCardPost;
