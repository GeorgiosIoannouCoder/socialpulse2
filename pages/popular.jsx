import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Segment } from "semantic-ui-react";
import baseUrl from "../utils/baseUrl";
import PopularCardPost from "../components/Post/PopularCardPost";
import { TrendyHeaderMessage } from "../components/Common/WelcomeMessage";

function Popular() {
  const [posts, setPosts] = useState([]);

  const fetchDataOnScroll = async () => {
    try {
      const res = await axios.get(`${baseUrl}/api/popular`, {});

      setPosts(res.data);
    } catch (error) {
      alert("Error fetching Posts!");
    }
  };

  useEffect(() => {
    fetchDataOnScroll();
  }, []);

  return (
    <>
      <TrendyHeaderMessage />
      <Segment color="blue">
        {posts.map((post) => (
          <PopularCardPost key={post._id} post={post} setPosts={setPosts} />
        ))}
      </Segment>
    </>
  );
}

export default Popular;
