import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Form, Button, Message, Segment, Divider } from "semantic-ui-react";
import baseUrl from "../utils/baseUrl";
import CommonInputs from "../components/Common/CommonInputs";
import ImageDropDiv from "../components/Common/ImageDropDiv";
import {
  HeaderMessage,
  FooterMessage,
} from "../components/Common/WelcomeMessage";
import { registerUser } from "../utils/authUser";
import uploadPic from "../utils/uploadPicToCloudinary";

const regexUserName =
  /^(?!.*\.\.)(?!.*\.$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,28}[A-Za-z0-9])?$/;

let cancel;

function Signup() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    bio: "",
    facebook: "",
    youtube: "",
    twitter: "",
    instagram: "",
  });
  const { name, email, password, bio } = user;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "media") {
      setMedia(files[0]);
      setMediaPreview(URL.createObjectURL(files[0]));
    }

    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const [showSocialLinks, setShowSocialLinks] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [username, setUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [termsConditions, setTermsConditions] = useState(false);
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [highlighted, setHighlighted] = useState(false);
  const [role, setRole] = useState(""); // Add state for selected role
  const inputRef = useRef();

  useEffect(() => {
    const isUser = Object.values({ name, email, password, bio }).every((item) =>
      Boolean(item)
    );
    // Update submitDisabled based on the conditions.
    isUser && role ? setSubmitDisabled(false) : setSubmitDisabled(true);
  }, [user]);

  const checkUsername = async () => {
    setUsernameLoading(true);
    try {
      cancel && cancel();

      const CancelToken = axios.CancelToken;

      const res = await axios.get(`${baseUrl}/api/signup/${username}`, {
        cancelToken: new CancelToken((canceler) => {
          cancel = canceler;
        }),
      });

      if (errorMsg !== null) setErrorMsg(null);

      if (res.data === "Available") {
        setUsernameAvailable(true);
        setUser((prev) => ({ ...prev, username }));
      }
    } catch (error) {
      if (error.response && error.response.data === "Username already taken!") {
        setErrorMsg(error.response.data);
      } else if (
        error.response &&
        error.response.data ===
          "Username should be between 1 and 30 characters!"
      ) {
        setErrorMsg(error.response.data);
      } else {
        setErrorMsg(
          "Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen!"
        );
      }

      setUsernameAvailable(false);
    }
    setUsernameLoading(false);
  };

  useEffect(() => {
    username === "" ? setUsernameAvailable(false) : checkUsername();
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    let profilePicUrl;
    if (media !== null) {
      profilePicUrl = await uploadPic(media);
    }

    if (media !== null && !profilePicUrl) {
      setFormLoading(false);
      return setErrorMsg("Error Uploading Image!");
    }

    await registerUser(user, role, profilePicUrl, setErrorMsg, setFormLoading);
  };

  // creating variables for the different type of user roles
  const userOptions = [
    { key: "Ordinary", text: "Ordinary User", value: "Ordinary" },
    { key: "Corporate", text: "Corporate User", value: "Corporate" },
  ];

  const handleDropdownRole = (e, { value }) => {
    // Update the state with the selected value.
    setRole(value);
  };

  // Terms and Conditions.
  // const [value, setValue] = useState(null);

  const handleTermsConditionsCheckboxChange = (e, data) => {
    if (termsConditions === true) {
      setTermsConditions(false);
    } else {
      setTermsConditions(true);
    }
  };

  return (
    <>
      <HeaderMessage />
      <Form
        loading={formLoading}
        error={errorMsg !== null}
        onSubmit={handleSubmit}
      >
        <Segment inverted>
          <ImageDropDiv
            mediaPreview={mediaPreview}
            setMediaPreview={setMediaPreview}
            setMedia={setMedia}
            inputRef={inputRef}
            highlighted={highlighted}
            setHighlighted={setHighlighted}
            handleChange={handleChange}
          />
          {/* allowing users to enter their name */}
          <Form.Input
            required
            label="Name"
            placeholder="Name"
            name="name"
            value={name}
            onChange={handleChange}
            fluid
            icon="user"
            iconPosition="left"
          />
          {/* allowing users to enter their email */}
          <Form.Input
            required
            label="Email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={handleChange}
            fluid
            icon="envelope"
            iconPosition="left"
            type="email"
          />
          {/* allowing users to enter their password */}
          <Form.Input
            label="Password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={handleChange}
            fluid
            icon={{
              name: showPassword ? "eye slash" : "eye",
              circular: true,
              link: true,
              onClick: () => setShowPassword(!showPassword),
            }}
            iconPosition="left"
            type={showPassword ? "text" : "password"}
            required
          />
          {/* allowing users to enter their username */}
          <Form.Input
            loading={usernameLoading}
            error={!usernameAvailable}
            required
            label="Username"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (regexUserName.test(e.target.value)) {
                setUsernameAvailable(true);
              } else {
                setUsernameAvailable(false);
              }
            }}
            fluid
            icon={usernameAvailable ? "check" : "close"}
            iconPosition="left"
          />
          {/* allowing users to choose their role when signing up */}
          <Form.Dropdown
            label="User Role"
            placeholder="Choose Your Role"
            options={userOptions}
            // onClick={() => setSelectedRole(true)}
            onChange={handleDropdownRole}
            search
            selection
            clearable
            required
          />
          <CommonInputs
            user={user}
            showSocialLinks={showSocialLinks}
            setShowSocialLinks={setShowSocialLinks}
            handleChange={handleChange}
          />
          <Divider hidden />
          <Form.Checkbox
            label="I agree to the Terms and Conditions"
            value="Accepted"
            checked={termsConditions}
            onClick={handleTermsConditionsCheckboxChange}
            required
          />
          Terms and Conditions: <b>{termsConditions}</b>
          <Divider hidden />
          <Button
            icon="signup"
            content="Signup"
            type="submit"
            color="blue"
            disabled={submitDisabled || !usernameAvailable || !termsConditions}
          />
        </Segment>
        <Message
          icon="delete"
          error
          header="Oh no!"
          content={errorMsg}
          onDismiss={() => setErrorMsg(null)}
        />
      </Form>

      <FooterMessage />
    </>
  );
}

export default Signup;
