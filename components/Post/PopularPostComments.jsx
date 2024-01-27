import React, { useState } from "react";
import { Comment, Icon, Popup } from "semantic-ui-react";
import calculateTime from "../../utils/calculateTime";
import { deleteComment } from "../../utils/postActions";

function PopularPostComments({ comment, setComments, postId }) {
  const [disabled, setDisabled] = useState(false);
  const [deleteIcon, showDeleteIcon] = useState(false);

  return (
    <>
      <Comment.Group>
        <Comment>
          <Comment.Avatar src={comment.user.profilePicUrl} />
          <Comment.Content>
            <Comment.Author as="a" href={`/${comment.user.username}`}>
              {comment.user.name}
            </Comment.Author>
            <Comment.Metadata>{calculateTime(comment.date)}</Comment.Metadata>

            <Comment.Text>{comment.text}</Comment.Text>
          </Comment.Content>
        </Comment>
      </Comment.Group>
    </>
  );
}

export default PopularPostComments;
