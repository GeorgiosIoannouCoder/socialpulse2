import React, { useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import Router from "next/router";
import { List, Popup, Image } from "semantic-ui-react";
import baseUrl from "../../utils/baseUrl";
import catchErrors from "../../utils/catchErrors";
import { ReadsPlaceHolder } from "../Layout/PlaceHolderGroup";

function ReadsList({ postId, trigger }) {
  const [readsList, setReadsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const getReadsList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/posts/read/${postId}`, {
        headers: { Authorization: cookie.get("token") },
      });
      setReadsList(res.data);
    } catch (error) {
      alert(catchErrors(error));
    }
    setLoading(false);
  };

  return (
    <Popup
      on="click"
      onClose={() => setReadsList([])}
      onOpen={getReadsList}
      popperDependencies={[readsList]}
      trigger={trigger}
      wide
    >
      {loading ? (
        <ReadsPlaceHolder />
      ) : (
        <>
          {readsList.length > 0 && (
            <div
              style={{
                overflow: "auto",
                maxHeight: "15rem",
                height: "15rem",
                minWidth: "210px",
              }}
            >
              <List selection size="large">
                {readsList.map((read) => (
                  <List.Item key={read._id}>
                    <Image avatar src={read.user.profilePicUrl} />

                    <List.Content>
                      <List.Header
                        onClick={() => Router.push(`/${read.user.username}`)}
                        as="a"
                        content={read.user.name}
                      />
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </div>
          )}
        </>
      )}
    </Popup>
  );
}

export default ReadsList;
