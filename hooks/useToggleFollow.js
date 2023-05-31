import { useState } from "react";

import useFetch, { fetchData } from "./useFetch";

export default function useToggleFollow(followId, currentLoggedInUser) {
  // check if the user (who created the post) has the currentLoggedInUser in his followers list
  // => then currentLoggedInUser already follows this person
  const [followStatus, setFollowStatus] = useState(false);

  useFetch(
    "GET",
    "/api/user/getFollowers/",
    { userId: followId },
    null,
    (res) => {
      if (!res.ok) return console.log(res.error);
      setFollowStatus(
        !!res.data.find((follower) => follower.username === currentLoggedInUser)
      );
    }
  );

  const toggleFollow = async () => {
    const follow = await fetchData("POST", "/api/user/setFollow", {
      followId,
      followStatus: !followStatus,
    });
    if (!follow.ok) return console.log(follow.error);
    setFollowStatus((prev) => !prev);
    console.log(follow.data);
  };

  return [followStatus, toggleFollow];
}
