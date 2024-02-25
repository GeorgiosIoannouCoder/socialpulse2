import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Form, Button, Message, Segment, Divider } from "semantic-ui-react";
import baseUrl from "../../utils/baseUrl";
import catchErrors from "../../utils/catchErrors";

function TokenPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState({
    password1: "",
    password2: "",
  });
  const { password1, password2 } = newPassword;
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [success, setSuccess] = useState(false);
  const [typed, showTyped] = useState({
    field1: false,
    field2: false,
  });

  const { field1, field2 } = typed;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewPassword((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    errorMsg !== null && setTimeout(() => setErrorMsg(null), 5000);
  }, [errorMsg]);

  const resetPassword = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      if (password1 !== password2) {
        return setErrorMsg("Passwords do not match!");
      }

      await axios.post(`${baseUrl}/api/reset/token`, {
        password: password1,
        token: router.query.token,
      });

      setSuccess(true);
    } catch (error) {
      setErrorMsg(catchErrors(error));
    }

    setLoading(false);
  };

  return (
    <>
      {success ? (
        <Message
          attached
          success
          size="large"
          header="Password reset successfull"
          icon="check"
          content="Login Again"
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/login")}
        />
      ) : (
        <Message
          attached
          icon="settings"
          header="Reset Password"
          color="blue"
        />
      )}

      {!success && (
        <Form
          loading={loading}
          onSubmit={resetPassword}
          error={errorMsg !== null}
        >
          <Message error header="Oh no!" content={errorMsg} />

          <Segment>
            <Form.Input
              fluid
              icon={{
                name: field1 ? "eye slash" : "eye",
                circular: true,
                link: true,
                onClick: () =>
                  showTyped((prev) => ({ ...prev, field1: !field1 })),
              }}
              type={field1 ? "text" : "password"}
              iconPosition="left"
              label="New Password"
              placeholder="Enter new Password"
              name="password1"
              onChange={handleChange}
              value={password1}
              required
            />
            <Form.Input
              fluid
              icon={{
                name: field2 ? "eye slash" : "eye",
                circular: true,
                link: true,
                onClick: () =>
                  showTyped((prev) => ({ ...prev, field2: !field2 })),
              }}
              type={field2 ? "text" : "password"}
              iconPosition="left"
              label="Confirm Password"
              placeholder="Confirm new Password"
              name="password2"
              onChange={handleChange}
              value={password2}
              required
            />

            <Divider hidden />

            <Button
              disabled={password1 === "" || password2 === "" || loading}
              icon="configure"
              type="submit"
              color="green"
              content="Reset"
            />
          </Segment>
        </Form>
      )}
    </>
  );
}

export default TokenPage;
