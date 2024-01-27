import React, { useState } from "react";
import axios from "axios";
import cookie from "js-cookie";
import Router from "next/router";
import { List, Popup, Image } from "semantic-ui-react";
import baseUrl from "../../utils/baseUrl";
import catchErrors from "../../utils/catchErrors";
import { LikesPlaceHolder } from "../Layout/PlaceHolderGroup";

function LikesList({ postId, trigger }) {
  const [likesList, setLikesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const getLikesList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/posts/like/${postId}`, {
        headers: { Authorization: cookie.get("token") },
      });
      setLikesList(res.data);
    } catch (error) {
      alert(catchErrors(error));
    }
    setLoading(false);
  };

  return (
    <Popup
      on="click"
      onClose={() => setLikesList([])}
      onOpen={getLikesList}
      popperDependencies={[likesList]}
      trigger={trigger}
      wide
    >
      {loading ? (
        <LikesPlaceHolder />
      ) : (
        <>
          {likesList.length > 0 && (
            <div
              style={{
                overflow: "auto",
                maxHeight: "15rem",
                height: "15rem",
                minWidth: "210px",
              }}
            >
              <List selection size="large">
                {likesList.map((like) => (
                  <List.Item key={like._id}>
                    <Image avatar src={like.user.profilePicUrl} />

                    <List.Content>
                      <List.Header
                        onClick={() => Router.push(`/${like.user.username}`)}
                        as="a"
                        content={like.user.name}
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

export default LikesList;
