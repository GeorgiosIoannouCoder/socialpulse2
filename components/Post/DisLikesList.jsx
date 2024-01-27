import React, { useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import Router from "next/router";
import { List, Popup, Image } from "semantic-ui-react";
import baseUrl from "../../utils/baseUrl";
import catchErrors from "../../utils/catchErrors";
import { DislikesPlaceHolder } from "../Layout/PlaceHolderGroup";

function DisLikesList({ postId, trigger }) {
  const [disLikesList, setDisLikesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const getDisLikesList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/posts/dislike/${postId}`, {
        headers: { Authorization: cookie.get("token") },
      });
      setDisLikesList(res.data);
    } catch (error) {
      alert(catchErrors(error));
    }
    setLoading(false);
  };

  return (
    <Popup
      on="click"
      onClose={() => setDisLikesList([])}
      onOpen={getDisLikesList}
      popperDependencies={[disLikesList]}
      trigger={trigger}
      wide
    >
      {loading ? (
        <DislikesPlaceHolder />
      ) : (
        <>
          {disLikesList.length > 0 && (
            <div
              style={{
                overflow: "auto",
                maxHeight: "15rem",
                height: "15rem",
                minWidth: "210px",
              }}
            >
              <List selection size="large">
                {disLikesList.map((dislike) => (
                  <List.Item key={dislike._id}>
                    <Image avatar src={dislike.user.profilePicUrl} />

                    <List.Content>
                      <List.Header
                        onClick={() => Router.push(`/${dislike.user.username}`)}
                        as="a"
                        content={dislike.user.name}
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

export default DisLikesList;
