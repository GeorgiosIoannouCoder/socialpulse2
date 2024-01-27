import React, { useState, useEffect, useRef } from "react";
import {
  List,
  Divider,
  Message,
  Checkbox,
  Form,
  Button,
  Segment,
  Input,
  Label,
} from "semantic-ui-react";
import { passwordUpdate, toggleMessagePopup } from "../../utils/profileActions";
import { withdrawMoney, depositMoney } from "../../utils/userActions";

function Settings({ user, newMessagePopup }) {
  const [passwordFields, showPasswordFields] = useState(false);
  const [newMessageSettings, showNewMessageSettings] = useState(false);
  const isFirstRun = useRef(true);
  const [popupSetting, setPopupSetting] = useState(newMessagePopup);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [errorAccountBalance, setErrorAccountBalance] = useState(false);

  useEffect(() => {
    success && setTimeout(() => setSuccess(false), 3000);
  }, [success]);

  useEffect(() => {
    error && setTimeout(() => setError(false), 3000);
  }, [error]);

  useEffect(() => {
    errorAccountBalance &&
      setTimeout(() => setErrorAccountBalance(false), 3000);
  }, [errorAccountBalance]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
  }, [popupSetting]);

  // variables to handle account balance transactions
  const [inputAmount, setInputAmount] = useState("");

  return (
    <>
      {success && (
        <>
          <Message success icon="check circle" header="Updated Successfully!" />
          <Divider hidden />
        </>
      )}
      {error && (
        <>
          <Message
            error
            icon="times circle"
            header="Invalid Current Password!"
          />
          <Divider hidden />
        </>
      )}
      {errorAccountBalance && (
        <>
          <Message
            error
            icon="times circle"
            header="Error Updating Account Balance!"
          />
          <Divider hidden />
        </>
      )}

      <List size="huge" animated inverted>
        <List.Item>
          <List.Icon
            name="spy"
            size="large"
            verticalAlign="middle"
            color="olive"
          />
          <List.Content>
            <List.Header
              onClick={() => showPasswordFields(!passwordFields)}
              as="a"
              content="Update Password"
            />
          </List.Content>

          {passwordFields && (
            <UpdatePassword
              setSuccess={setSuccess}
              setError={setError}
              showPasswordFields={showPasswordFields}
            />
          )}
        </List.Item>
        <Divider />

        <List.Item>
          <List.Icon
            name="mail outline"
            size="large"
            verticalAlign="middle"
            color="olive"
          />

          <List.Content>
            <List.Header
              onClick={() => showNewMessageSettings(!newMessageSettings)}
              as="a"
              content="Show New Message Popup"
            />
          </List.Content>

          <div style={{ marginTop: "10px", color: "white" }}>
            Control whether a popup message should appear when there is a new
            message or not.
            <br />
            <br />
            <Checkbox
              checked={popupSetting}
              toggle
              onChange={() =>
                toggleMessagePopup(
                  popupSetting,
                  setPopupSetting,
                  setSuccess,
                  setError
                )
              }
            />
          </div>
        </List.Item>
        <Divider />
        {user.role !== "Super" && (
          <>
            <div style={{ marginTop: "10px", color: "white" }}>
              <List.Icon
                name="money bill alternate outline"
                size="large"
                verticalAlign="middle"
                color="olive"
              />
              <b>
                <div style={{ display: "inline", marginLeft: "12px" }}>
                  Total Account Balance:
                  <div
                    style={{
                      display: "inline",
                      color: "green",
                      marginLeft: "5px",
                    }}
                  >
                    ${user.accountBalance}
                  </div>
                </div>
              </b>
              <br />
              <List.Icon
                name="thumbs up outline"
                size="large"
                verticalAlign="middle"
                color="olive"
                style={{
                  marginTop: "12px",
                }}
              />
              <b>
                <div
                  style={{
                    marginTop: "-23px",

                    marginLeft: "52px",
                  }}
                >
                  TIPS:
                  <div
                    style={{
                      display: "inline",
                      color: "green",
                      marginLeft: "5px",
                    }}
                  >
                    ${user.tips}
                  </div>
                </div>
              </b>
              <br />
              <br />
            </div>
            <div>
              <Input
                labelPosition="right"
                type="text"
                placeholder="Amount"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
              >
                <Label basic>$</Label>
                <input />
              </Input>
            </div>
            <div style={{ marginTop: "10px" }}>
              <Button
                onClick={async (e) => {
                  e.preventDefault();
                  await withdrawMoney(
                    user._id,
                    setSuccess,
                    setErrorAccountBalance,
                    inputAmount
                  );
                }}
                color="red"
                style={{
                  borderRadius: "30px",
                }}
              >
                Withdraw
              </Button>
              <Button
                onClick={async (e) => {
                  e.preventDefault();
                  await depositMoney(
                    user._id,
                    setSuccess,
                    setErrorAccountBalance,
                    inputAmount
                  );
                }}
                color="green"
                style={{
                  borderRadius: "30px",
                }}
              >
                Deposit
              </Button>
            </div>{" "}
            <Divider />
            <div style={{ marginTop: "10px", color: "white" }}>
              <List.Icon
                name="book"
                size="large"
                verticalAlign="middle"
                color="red"
              />
              <b>
                <div style={{ display: "inline", marginLeft: "12px" }}>
                  Charging Rules:
                </div>
              </b>
              <ol>
                <li>Corporate users are charged $1 per word.</li>
                <li style={{ marginTop: "20px" }}>
                  Non-corporate users:
                  <ol type="a">
                    <li>The first 20 words are free.</li>
                    <li>Words beyond 20 are charged at $0.1 each.</li>
                  </ol>
                </li>
                <li style={{ marginTop: "20px" }}>
                  All users:
                  <ol type="a">
                    <li>Image costs 10 words.</li>
                    <li>Video costs 15 words.</li>
                  </ol>
                </li>
              </ol>
            </div>
            <Divider />
          </>
        )}
        <List.Content>
          <List.Header as="a" content="" />
        </List.Content>
      </List>
    </>
  );
}

const UpdatePassword = ({ setSuccess, setError, showPasswordFields }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [userPasswords, setUserPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [typed, showTyped] = useState({
    field1: false,
    field2: false,
  });

  const { field1, field2 } = typed;

  const { currentPassword, newPassword } = userPasswords;

  const isPasswordValid = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{4,}$/;

    if (!passwordRegex.test(password)) {
      if (password.length < 4) {
        setErrorMsg("Password must be at minimum four characters!");
      } else if (!/(?=.*[a-z])/.test(password)) {
        setErrorMsg("Password must contain at least one lowercase letter!");
      } else if (!/(?=.*[A-Z])/.test(password)) {
        setErrorMsg("Password must contain at least one uppercase letter!");
      } else if (!/(?=.*\d)/.test(password)) {
        setErrorMsg("Password must contain at least one number!");
      } else if (!/(?=.*[@$!%*?&])/.test(password)) {
        setErrorMsg("Password must contain at least one special character!");
      }

      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserPasswords((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    errorMsg && setTimeout(() => setErrorMsg(null), 5000);
  }, [errorMsg]);

  return (
    <>
      <Form
        error={errorMsg !== null}
        loading={loading}
        onSubmit={async (e) => {
          e.preventDefault();
          // Validate password before submitting.
          if (!isPasswordValid(newPassword)) {
            return;
          }
          setLoading(true);
          await passwordUpdate(setSuccess, setError, userPasswords);
          setLoading(false);
          showPasswordFields(false);
        }}
        inverted
      >
        <List.List>
          <List.Item>
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
              label="Current Password"
              placeholder="Enter current Password"
              name="currentPassword"
              onChange={handleChange}
              value={currentPassword}
              inverted
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
              label="New Password"
              placeholder="Enter New Password"
              name="newPassword"
              onChange={handleChange}
              value={newPassword}
              inverted
              required
            />

            <Button
              disabled={loading || currentPassword === "" || newPassword === ""}
              compact
              icon="configure"
              type="submit"
              color="blue"
              content="Confirm"
            />

            <Button
              disabled={loading}
              compact
              icon="cancel"
              type="button"
              content="Cancel"
              color="red"
              onClick={() => showPasswordFields(false)}
            />

            <Message icon="meh" error header="Oh no!" content={errorMsg} />
          </List.Item>
        </List.List>
      </Form>
      <Divider hidden />
    </>
  );
};

export default Settings;
