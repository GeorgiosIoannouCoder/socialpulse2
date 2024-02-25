import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import ProgressSentiment from "../../mlComponents/sentiment/ProgressSentiment";
import ProgressTranslator from "../../mlComponents/translator/ProgressTranslator";
import LanguageSelectorTranslator from "../../mlComponents/translator/LanguageSelectorTranslator";
import {
  Card,
  Icon,
  Image,
  Divider,
  Segment,
  Button,
  Popup,
  Header,
  Modal,
  Label,
  Form,
  FormGroup,
  TextArea,
  Message,
  Embed,
  MessageHeader,
  MessageContent,
} from "semantic-ui-react";
import PostComments from "./PostComments";
import CommentInputField from "./CommentInputField";
import calculateTime from "../../utils/calculateTime";
import {
  deletePost,
  likePost,
  dislikePost,
  reportPost,
  readPost,
  tipPost,
} from "../../utils/postActions";
import LikesList from "./LikesList";
import DisLikesList from "./DisLikesList";
import ReportPostList from "./ReportPostList";
import ReadsList from "./ReadsList";
import ImageModal from "./ImageModal";
import NoImageModal from "./NoImageModal";

const lngDetector = new (require("languagedetect"))();

function CardPost({ post, user, setPosts, setShowToastr }) {
  const [reads, setReads] = useState(post.reads);
  const hasRead =
    post.reads.some((read) => read.user.toString() === user._id) ||
    post.user._id.toString() === user._id;
  const [isRead, setIsRead] = useState(hasRead);
  const [likes, setLikes] = useState(post.likes);
  const [dislikes, setDisLikes] = useState(post.dislikes);
  const [comments, setComments] = useState(post.comments);
  const [tip, setTip] = useState(1);
  const [reports, setReports] = useState(post.reports);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFullText, setShowFullText] = useState(false);
  const [resultSentiment, setResultSentiment] = useState(null);
  const [readySentiment, setReadySentiment] = useState(null);
  const [disabledSentiment, setDisabledSentiment] = useState(false);
  const [progressItemsSentiment, setProgressItemsSentiment] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [openReport, setOpenReport] = useState(false);
  const [tipModal, setTipModal] = useState(false);
  const [translateModal, setTranslateModal] = useState(false);
  const [readyTranslator, setReadyTranslator] = useState(null);
  const [disabledTranslator, setDisabledTranslator] = useState(false);
  const [progressItemsTranslator, setProgressItemsTranslator] = useState([]);
  const [inputTranslator, setInputTranslator] = useState(post.text);
  const [sourceLanguageTranslator, setSourceLanguageTranslator] =
    useState("eng_Latn");
  const [targetLanguageTranslator, setTargetLanguageTranslator] =
    useState("ell_Grek");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [postLanguage, setPostLanguage] = useState("");
  const [outputTranslator, setOutputTranslator] = useState("");
  const workerSentiment = useRef(null);
  const workerTranslator = useRef(null);

  const isLiked =
    likes.length > 0 &&
    likes.filter((like) => like.user === user._id).length > 0;

  const isDisLiked =
    dislikes.length > 0 &&
    dislikes.filter((dislike) => dislike.user === user._id).length > 0;

  const addPropsToModal = () => ({
    post,
    user,
    setReads,
    setLikes,
    setDisLikes,
    reads,
    likes,
    dislikes,
    isLiked,
    isDisLiked,
    setPosts,
    setShowToastr,
    comments,
    setComments,
    reports,
    setReports,
  });

  // Function to handle when a user clicks the "Read" button.
  const readPostOnClick = () => {
    setShowFullText(!showFullText);
    readPost(post._id, user._id, setReads);
    setIsRead(true);
  };

  const handleDropdownChangeSourceLanguageTranslator = async (e, { value }) => {
    // Update the state with the selected value.
    setSourceLanguageTranslator(value);
  };

  const handleDropdownChangeTargetLanguageTranslator = async (e, { value }) => {
    // Update the state with the selected value.
    setTargetLanguageTranslator(value);
  };

  const handleDropdownChangeTip = async (e, { value }) => {
    // Update the state with the selected value.
    setTip(value);
    await tipPost(post, user, value);
  };

  // Creating variables for the different tip options.
  const tipTypeOptions = [
    { key: "One", text: "$1", value: 1 },
    { key: "Five", text: "$5", value: 5 },
    { key: "Ten", text: "$10", value: 10 },
  ];

  const getPostLanguage = () => {
    const languageDetected = lngDetector.detect(post.text, 1);
    const language =
      languageDetected.length === 1 ? languageDetected[0][0] : languageDetected;

    setPostLanguage(language);
  };

  const getPreferredLanguage = () => {
    const language = window.navigator.language
      ? window.navigator.language.split("-")[0]
      : "en";

    setPreferredLanguage(language);
  };

  const getLanguages = () => {
    getPostLanguage();
    getPreferredLanguage();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await reportPost(
      post,
      user,
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

  // We use the `useEffect` hook to setup the workerSentiment as soon as the `App` component is mounted.
  useEffect(() => {
    if (!workerSentiment.current) {
      // Create the workerSentiment if it does not yet exist.
      workerSentiment.current = new Worker(
        new URL(
          "../../mlComponents/sentiment/workerSentiment.js",
          import.meta.url
        ),
        {
          type: "module",
        }
      );
    }

    // Create a callback function for messages from the workerSentiment thread.
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case "initiate":
          setReadySentiment(false);
          setProgressItemsSentiment((prev) => [...prev, e.data]);
          break;
        case "progress":
          // Model file progress: update one of the progress items.
          setProgressItemsSentiment((prev) =>
            prev.map((item) => {
              if (item.file === e.data.file) {
                return { ...item, progress: e.data.progress };
              }
              return item;
            })
          );
          break;
        case "done":
          // Model file loaded: remove the progress item from the list.
          setProgressItemsSentiment((prev) =>
            prev.filter((item) => item.file !== e.data.file)
          );
          break;
        case "ready":
          setReadySentiment(true);
          break;
        case "complete":
          setResultSentiment(e.data.output[0]);
          setDisabledSentiment(false);
          break;
      }
    };

    // Attach the callback function as an event listener.
    workerSentiment.current.addEventListener("message", onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () =>
      workerSentiment.current.removeEventListener("message", onMessageReceived);
  });

  const classify = useCallback((text) => {
    setDisabledSentiment(true);
    if (workerSentiment.current) {
      workerSentiment.current.postMessage({ text });
    }
  }, []);

  const sentimentAnalysisClick = () => {
    classify(post.text);
  };

  // We use the `useEffect` hook to setup the workerTranslator as soon as the `App` component is mounted.
  useEffect(() => {
    if (!workerTranslator.current) {
      // Create the worker if it does not yet exist.
      workerTranslator.current = new Worker(
        new URL(
          "../../mlComponents/translator/workerTranslator.js",
          import.meta.url
        ),
        {
          type: "module",
        }
      );
    }

    // Create a callback function for messages from the workerTranslator thread.
    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case "initiate":
          // Model file start load: add a new progress item to the list.
          setReadyTranslator(false);
          setProgressItemsTranslator((prev) => [...prev, e.data]);
          break;

        case "progress":
          // Model file progress: update one of the progress items.
          setProgressItemsTranslator((prev) =>
            prev.map((item) => {
              if (item.file === e.data.file) {
                return { ...item, progress: e.data.progress };
              }
              return item;
            })
          );
          break;

        case "done":
          // Model file loaded: remove the progress item from the list.
          setProgressItemsTranslator((prev) =>
            prev.filter((item) => item.file !== e.data.file)
          );
          break;

        case "ready":
          // Pipeline ready: the workerTranslator is ready to accept messages.
          setReadyTranslator(true);
          break;

        case "update":
          // Generation update: update the output text.
          setOutputTranslator(e.data.output);
          break;

        case "complete":
          // Generation complete: re-enable the "Translate" button.
          setDisabledTranslator(false);
          break;
      }
    };

    // Attach the callback function as an event listener.
    workerTranslator.current.addEventListener("message", onMessageReceived);

    // Define a cleanup function for when the component is unmounted.
    return () =>
      workerTranslator.current.removeEventListener(
        "message",
        onMessageReceived
      );
  });

  const translate = () => {
    setDisabledTranslator(true);
    workerTranslator.current.postMessage({
      text: inputTranslator,
      src_lang: sourceLanguageTranslator,
      tgt_lang: targetLanguageTranslator,
    });
  };

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
              <ImageModal {...addPropsToModal()} />
            ) : (
              <NoImageModal {...addPropsToModal()} />
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

            {(user.role === "Super" || post.user._id === user._id) && (
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
                    onClick={() =>
                      deletePost(post._id, setPosts, setShowToastr)
                    }
                  />
                </Popup>
              </>
            )}

            <Card.Header>
              <Link href={`/${post.user.username}`}>
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
                fontSize: showFullText || hasRead ? "20px" : "10px",
                color: showFullText || hasRead ? "#23272f" : "transparent",
                overflow: "hidden",
                marginTop: "10px",
                textShadow: showFullText || hasRead ? "" : "0 0 8px #000",
              }}
              onCopy={(e) => e.preventDefault()}
            >
              {post.text}
            </Card.Description>

            {readySentiment !== null && (
              <pre className="bg-gray-100 p-2 rounded">
                {!readySentiment || !resultSentiment ? (
                  <>
                    <Message icon size="mini" color="black">
                      <Icon name="circle notched" color="blue" loading />
                      <MessageContent>
                        <MessageHeader>Just one second</MessageHeader>
                        We are analyzing that content for you.
                      </MessageContent>
                    </Message>
                    {progressItemsSentiment.map((data) => (
                      <div key={data.file}>
                        <ProgressSentiment
                          text={data.file}
                          percentage={data.progress}
                        />
                      </div>
                    ))}
                  </>
                ) : (
                  JSON.stringify(resultSentiment, null, 2)
                )}
              </pre>
            )}

            <Button
              as="div"
              labelPosition="right"
              floated="left"
              style={{ marginTop: "5px" }}
              size="tiny"
              disabled={disabledSentiment}
              onClick={sentimentAnalysisClick}
            >
              <Icon name="binoculars" size="large" color="black" fitted />
            </Button>

            <Modal
              closeIcon
              open={translateModal}
              trigger={
                <Button
                  as="div"
                  labelPosition="right"
                  floated="left"
                  style={{ marginTop: "5px" }}
                  size="tiny"
                  onClick={getLanguages}
                >
                  <Icon name="translate" size="large" color="blue" fitted />
                </Button>
              }
              onClose={() => setTranslateModal(false)}
              onOpen={() => setTranslateModal(true)}
            >
              <Header icon="translate" content="Translate Post" />
              <Modal.Content>
                <Message size="mini" color="orange">
                  {postLanguage.length === 0
                    ? `Post language: ${post.language}`
                    : `Post language detected by model: ${
                        postLanguage.charAt(0).toUpperCase() +
                        postLanguage.slice(1)
                      }`}
                </Message>

                <Message size="mini" color="orange">
                  Preferred language: {preferredLanguage.toUpperCase()}
                </Message>
                <Form>
                  <FormGroup widths="equal">
                    <LanguageSelectorTranslator
                      type={"Source"}
                      defaultLanguage={"eng_Latn"}
                      onChange={handleDropdownChangeSourceLanguageTranslator}
                    />
                    <LanguageSelectorTranslator
                      type={"Target"}
                      defaultLanguage={"ell_Grek"}
                      onChange={handleDropdownChangeTargetLanguageTranslator}
                    />
                  </FormGroup>
                </Form>
                <Form>
                  <FormGroup widths="equal">
                    <TextArea
                      value={inputTranslator}
                      rows={3}
                      onChange={(e) => setInputTranslator(e.target.value)}
                      style={{
                        marginTop: -10,
                        marginLeft: 7,
                        marginRight: 10,
                      }}
                      readOnly
                    />
                    <TextArea
                      placeholder="Translated Text..."
                      value={outputTranslator}
                      rows={3}
                      style={{ marginTop: -10, marginLeft: 1, marginRight: 5 }}
                      readOnly
                    />
                  </FormGroup>
                </Form>

                <div className="progress-bars-container">
                  {readyTranslator === false && (
                    <Message icon size="mini" color="black">
                      <Icon name="circle notched" color="blue" loading />
                      <MessageContent>
                        <MessageHeader>Just one minute</MessageHeader>
                        We are loading the models for you.
                      </MessageContent>
                    </Message>
                  )}
                  {progressItemsTranslator.map((data) => (
                    <div key={data.file}>
                      <ProgressTranslator
                        text={data.file}
                        percentage={data.progress}
                      />
                    </div>
                  ))}
                </div>
              </Modal.Content>

              <Modal.Actions>
                <Button
                  color="blue"
                  disabled={disabledTranslator}
                  onClick={translate}
                >
                  <Icon name="translate" style={{ cursor: "pointer" }} />{" "}
                  Translate
                </Button>
                <Button color="red" onClick={() => setTranslateModal(false)}>
                  <Icon name="remove" style={{ cursor: "pointer" }} /> Close
                </Button>
              </Modal.Actions>
            </Modal>

            <Button
              as="div"
              labelPosition="right"
              style={{ marginTop: "30px" }}
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
                <ReadsList
                  postId={post._id}
                  trigger={
                    reads.length > 0 && (
                      <span className="spanReadsList">
                        {`${reads.length} ${
                          reads.length === 1 ? "read" : "reads"
                        }`}
                      </span>
                    )
                  }
                />
              </Label>
            </Button>
          </Card.Content>

          <Card.Content extra>
            <div>
              {/* Like */}
              <Button as="div" labelPosition="right">
                <Button
                  color="blue"
                  onClick={() =>
                    likePost(
                      post._id,
                      user._id,
                      setLikes,
                      setDisLikes,
                      isLiked ? false : true,
                      isDisLiked ? false : true
                    )
                  }
                >
                  <Icon
                    name={isLiked ? "thumbs up" : "thumbs up outline"}
                    style={{ cursor: "pointer" }}
                    fitted
                  />
                </Button>
                <Label as="a" basic color="blue" pointing="left">
                  <LikesList
                    postId={post._id}
                    trigger={
                      likes.length > 0 && (
                        <span className="spanLikesList">
                          {`${likes.length} ${
                            likes.length === 1 ? "like" : "likes"
                          }`}
                        </span>
                      )
                    }
                  />
                </Label>
              </Button>

              {/* Dislike */}
              <Button as="div" labelPosition="right">
                <Button
                  color="brown"
                  onClick={() =>
                    dislikePost(
                      post._id,
                      user._id,
                      setDisLikes,
                      setLikes,
                      isDisLiked ? false : true,
                      isLiked ? true : false
                    )
                  }
                >
                  <Icon
                    name={isDisLiked ? "thumbs down" : "thumbs down outline"}
                    style={{ cursor: "pointer" }}
                    fitted
                  />
                </Button>
                <Label as="a" basic color="brown" pointing="left">
                  <DisLikesList
                    postId={post._id}
                    trigger={
                      dislikes.length > 0 && (
                        <span className="spanDisLikesList">
                          {`${dislikes.length} ${
                            dislikes.length === 1 ? "dislike" : "dislikes"
                          }`}
                        </span>
                      )
                    }
                  />
                </Label>
              </Button>

              <Button as="div" labelPosition="right">
                <Button color="violet">
                  <Icon name="comment outline" />
                </Button>
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
                    <ReportPostList
                      postId={post._id}
                      trigger={
                        reports.length > 0 && (
                          <span className="spanReportPostList">
                            {`${reports.length} ${
                              reports.length === 1 ? "report" : "reports"
                            }`}
                          </span>
                        )
                      }
                    />
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
              {/* clickable tip button */}
              <Modal
                closeIcon
                open={tipModal}
                trigger={
                  <Button as="div" labelPosition="right">
                    <Button color="green">
                      <Icon
                        name="dollar sign"
                        style={{ cursor: "pointer" }}
                        fitted
                      />
                    </Button>
                  </Button>
                }
                onClose={() => setTipModal(false)}
                onOpen={() => setTipModal(true)}
              >
                <Header icon="dollar sign" content="Tip Post" />
                <Modal.Content>
                  <Form.Dropdown
                    label="How much would you like to tip this post?"
                    placeholder="Tip Amount"
                    defaultValue="one"
                    options={tipTypeOptions}
                    onChange={handleDropdownChangeTip}
                    style={{ marginLeft: 5 }}
                    search
                    selection
                    clearable
                  />
                </Modal.Content>

                {/* bottom buttons of the pop-up */}
                <Modal.Actions>
                  <Button color="red" onClick={() => setTipModal(false)}>
                    <Icon name="remove" style={{ cursor: "pointer" }} /> Cancel
                  </Button>
                  <Button color="green" onClick={() => setTipModal(false)}>
                    <Icon name="checkmark" style={{ cursor: "pointer" }} />{" "}
                    Submit
                  </Button>
                </Modal.Actions>
              </Modal>
            </div>

            {comments.length > 0 &&
              comments.map(
                (comment, i) =>
                  i < 3 && (
                    <PostComments
                      key={comment._id}
                      comment={comment}
                      postId={post._id}
                      user={user}
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

            <CommentInputField
              user={user}
              postId={post._id}
              setComments={setComments}
            />
          </Card.Content>
        </Card>
      </Segment>
      <Divider hidden />
    </>
  );
}

export default CardPost;
