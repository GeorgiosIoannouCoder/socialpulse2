import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Button,
  Image,
  Divider,
  Message,
  Icon,
  Dropdown,
} from "semantic-ui-react";
import uploadPic from "../../utils/uploadPicToCloudinary";
import uploadVid from "../../utils/uploadVidToCloudinary";
import uploadAudio from "../../utils/uploadAudioToCloudinary";
import { submitNewPost } from "../../utils/postActions";
import CropImageModal from "./CropImageModal";
import keywordss from "../../utils/keyWords";


function CreatePost({ user, setPosts }) {
  const [newPost, setNewPost] = useState({
    // Initial values for the new post.
    text: "",
    location: "",
    company: "",
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();
  const [error, setError] = useState(null);
  const [highlighted, setHighlighted] = useState(false);
  const [media, setMedia] = useState(null);
  const audioBlobRef = useRef(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "media") {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }

    setNewPost((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------- Variables for recording users audio -------------------
  // Instantiating variables.
  const [permission, setPermission] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [stream, setStream] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audio, setAudio] = useState(null);
  const mediaRecorder = useRef(null);
  const mimeType = "audio/webm";



  ///////////////////////////////////////////////////////
  // REAL TIME SPEECH RECOGNITION

  // Function to start speech recognition with the provided stream
  const startSpeechRecognition = (stream) => {
    var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.lang = navigator.language;
    // console.log(recognition.lang)
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = function (event) {
      var speechline = event.results[0][0].transcript;
      updateOutput(speechline);
    };

    recognition.onspeechend = function () {
      recognition.stop();
    };
    recognition.start();
  };


  const updateOutput = (speechline) => {
    //   console.log(speechline)

    // Update the newPost state with the recognized speech
    setNewPost(prevState => ({
      ...prevState,
      // text: prevState.text + speechline // Appending speechline to the existing text in the textarea
      text: speechline // Appending speechline to the existing text in the textarea

    }));
  };

  /////////////////////////////////////////////////////

  // Getting the microphone permission from the user.
  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser.");
    }
  };

  // Starting the recording.
  const startRecording = async () => {
    setRecordingStatus("recording");
    // Create new Media recorder instance using the stream.
    const media2 = new MediaRecorder(stream, { type: mimeType });
    // Set the MediaRecorder instance to the mediaRecorder ref.
    mediaRecorder.current = media2;
    // Invokes the start method to start the recording process.
    mediaRecorder.current.start();
    let localAudioChunks = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === "undefined") return;
      if (event.data.size === 0) return;
      localAudioChunks.push(event.data);
    };
    setAudioChunks(localAudioChunks);
  };

  // Stopping the recording.
  const stopRecording = () => {
    setRecordingStatus("inactive");

    // Stops the recording instance.
    mediaRecorder.current.stop();

    mediaRecorder.current.onstop = () => {
      // Creates a blob file from the audiochunks data.
      const audioBlob = new Blob(audioChunks, { type: mimeType });

      audioBlobRef.current = audioBlob;

      // Creates a playable URL from the blob file.
      const audioURL = URL.createObjectURL(audioBlob);

      setAudio(audioURL);

      setAudioChunks([]);
    };
  };

  const addStyles = () => ({
    textAlign: "center",
    height: "150px",
    width: "150px",
    border: "dotted",
    paddingTop: media === null && "60px",
    cursor: "pointer",
    borderColor: highlighted ? "green" : "black",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let picUrl;

    if (media !== null) {
      if (typeof media === "object" && media.type) {
        if (media.type.startsWith("image/")) {
          picUrl = await uploadPic(media);

          if (!picUrl) {
            setLoading(false);
            return setError("Error Uploading Image!");
          }
        } else if (media.type.startsWith("video/")) {
          picUrl = await uploadVid(media);

          // console.log("video url: ", picUrl);

          if (!picUrl) {
            setLoading(false);
            return setError("Error Uploading Video!");
          }
        }
      } else if (typeof media === "string" && media.startsWith("data:image/")) {
        picUrl = await uploadPic(media);

        if (!picUrl) {
          setLoading(false);
          return setError("Error Uploading Image!");
        }
      } else if (typeof media === "string" && media.startsWith("data:video/")) {
        picUrl = await uploadVid(media);

        if (!picUrl) {
          setLoading(false);
          return setError("Error Uploading Video!");
        }
      }
    }

    // Uploading the audio to cloudinary when user posts.
    // Automatic Speech Recognition.
    if (audioBlobRef.current != null) {
      const audioUploadUrl = await uploadAudio(audioBlobRef.current);

      if (!audioUploadUrl) {
        return setError("Error Uploading Audio!");
      }

      try {
        let { pipeline, env } = await import("@xenova/transformers");

        env.allowLocalModels = false;
        env.useBrowserCache = false;

        const transcriber = await pipeline(
          "automatic-speech-recognition",
          "Xenova/whisper-tiny.en"
        );

        const output = await transcriber(audioUploadUrl);

        console.log("Output: ", output);
      } catch (error) {
        return setError("Error Transcribing Audio!");
      }
    }

    await submitNewPost(
      newPost.text,
      newPost.location,
      newPost.company,
      type,
      keywords,
      picUrl,
      setPosts,
      setNewPost,
      setError
    );

    setMedia(null);
    setMediaPreview(null);
    setLoading(false);
  };

  // Creating variables for the different post type options.
  const postTypeOptions = [
    { key: "Regular", text: "Regular Post", value: "Regular" },
    { key: "Ad", text: "Ad Post", value: "Ad" },
    { key: "Job", text: "Job Post", value: "Job" },
  ];

  const [type, setType] = useState("");

  const [keywords, setKeywords] = useState([]);

  // Transform the keywords array into options required by the Dropdown component.
  const keywordsOptions = keywordss.map((keyword) => ({
    key: keyword,
    text: keyword,
    value: keyword,
  }));

  const handleDropdownChangeType = (e, { value }) => {
    // Update the state with the selected value.
    setType(value);
  };

  const handleDropdownChangeKeywords = (e, { value }) => {
    // Update the state with the selected value.
    setKeywords((prevKeywords) => [...prevKeywords, value]);
  };
  // ===============================================================================================
  return (
    <>
      {showModal && (
        <CropImageModal
          mediaPreview={mediaPreview}
          setMedia={setMedia}
          showModal={showModal}
          setShowModal={setShowModal}
        />
      )}

      <Form error={error !== null} onSubmit={handleSubmit}>
        <Message
          error
          onDismiss={() => setError(null)}
          content={error}
          header="Oh no!"
        />

        <Form.Group>
          <Image src={user.profilePicUrl} circular avatar inline />
          <Form.TextArea
            id="convert_text"
            placeholder="What's New?"
            name="text"
            value={newPost.text}
            onChange={handleChange}
            rows={4}
            width={14}
          />
        </Form.Group>

        <div className="audio-controls">
          {!permission ? (
            <Button
              style={{
                padding: "1em",
                marginLeft: "2em",
                marginBottom: "2em",
                marginTop: "0em",
              }}
              onClick={getMicrophonePermission}
              type="button"
            >
              Get Microphone
            </Button>
          ) : null}
          {permission && recordingStatus === "inactive" ? (
            <Button
              style={{
                padding: "1em",
                marginLeft: "2em",
                marginBottom: "2em",
                marginTop: "0em",
              }}
              onClick={startRecording}
              type="button"
            >
              Start Recording
            </Button>
          ) : null}
          {recordingStatus === "recording" ? (
            <Button
              style={{
                padding: "1em",
                marginLeft: "2em",
                marginBottom: "2em",
                marginTop: "0em",
              }}
              onClick={stopRecording}
              type="button"
            >
              Stop Recording
            </Button>
          ) : null}
        </div>
        {audio ? (
          <div
            style={{
              display: "inline-block",
              float: "right",
              marginRight: "5em",
              marginBottom: "-10em",
              position: "relative",
              top: "-71px",
            }}
            className="audio-container"
          >
            <audio src={audio} controls></audio>
          </div>
        ) : null}


        {/* Real Time Speech Recognition Button*/}
        <Button
          style={{
            padding: "1em",
            marginLeft: "auto",
            marginRight: "auto",
            display: "block",
            marginBottom: "2em",
            marginTop: "0em",
          }}
          type="button"
          onClick={startSpeechRecognition}
        >
          <i className="microphone icon" style={{ margin: "auto" }}></i> {/* Center the icon */}
        </Button>



        {/* allowing users to select keywords for their post */}
        <Form.Field>
          <label>Keywords</label>
          <Dropdown
            placeholder="Select Keywords"
            fluid
            multiple
            selection
            search
            options={keywordsOptions}
            onChange={handleDropdownChangeKeywords}
          />
        </Form.Field>

        {/* allowing users to add a location to their post */}
        <Form.Group>
          <Form.Input
            value={newPost.location}
            name="location"
            onChange={handleChange}
            label="Add Location"
            icon="map marker alternate"
            placeholder="Location?"
          />
          {(user.role === "Super" || user.role === "Corporate") && (
            <Form.Input
              value={newPost.company}
              name="company"
              onChange={handleChange}
              label="Add Company"
              icon="briefcase"
              placeholder="Company name?"
            />
          )}

          {/* allowing users to choose their post type */}
          {(user.role === "Super" || user.role === "Corporate") && (
            <Form.Dropdown
              label="Post Type"
              placeholder="Post Type?"
              options={
                user.role === "Super" || user.role === "Corporate"
                  ? postTypeOptions // Display all options for Super or Corporate users
                  : postTypeOptions.filter(
                    (option) => option.value === "Regular"
                  ) // Display only "Regular Post" for other users
              }
              onChange={handleDropdownChangeType}
              search
              selection
              clearable
            />
          )}
          <input
            ref={inputRef}
            onChange={handleChange}
            name="media"
            style={{ display: "none" }}
            type="file"
            accept="image/*, video/*"
          />
        </Form.Group>

        <div
          onClick={() => inputRef.current.click()}
          style={addStyles()}
          onDrag={(e) => {
            e.preventDefault();
            setHighlighted(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setHighlighted(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setHighlighted(true);

            const droppedFile = Array.from(e.dataTransfer.files);

            setMedia(droppedFile[0]);
            setMediaPreview(URL.createObjectURL(droppedFile[0]));
          }}
        >
          {media === null ? (
            <Icon name="plus" size="big" />
          ) : (
            <div style={{ textAlign: "center" }}>
              {(typeof media === "object" &&
                media.type &&
                media.type.startsWith("image/")) ||
                (typeof media === "string" && media.startsWith("data:image/")) ? (
                <Image
                  style={{ height: "150px", width: "150px" }}
                  src={mediaPreview}
                  alt="PostImage"
                  centered
                  size="medium"
                />
              ) : (
                <video width="150" height="150" controls>
                  <source src={mediaPreview} type={media.type} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
        </div>
        {mediaPreview !== null &&
          media !== null &&
          (typeof media === "object"
            ? media.type.startsWith("image/")
            : typeof media === "string" && media.startsWith("data:image/")) && (
            <>
              <Divider hidden />

              <Button
                content="Crop Image"
                type="button"
                primary
                circular
                onClick={() => setShowModal(true)}
              />
            </>
          )}

        <Divider hidden />

        <Button
          circular
          disabled={newPost.text === "" || loading}
          content={<strong>Post</strong>}
          style={{ backgroundColor: "#1DA1F2", color: "white" }}
          icon="send"
          loading={loading}
        />
      </Form>
      <Divider />
    </>
  );
}

export default CreatePost;
