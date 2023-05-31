import { getSession } from "next-auth/react";
import Head from "next/head";

import Header from "../components/Header/index";
import ProfilePage from "../components/Profile/ProfilePage";

import { getData as getUser } from "./api/user/getUser";
import { getData as getUserPosts } from "./api/posts/getUserPosts";
import { getData as getFollowers } from "./api/user/getFollowers";
import { getData as getFollows } from "./api/user/getFollows";

function Profile(props) {
  return (
    <>
      <Head>
        <title>{props.user.username}</title>
      </Head>
      <Header
        currentLoggedInUser={props.currentLoggedInUser}
        active="profile"
      ></Header>
      <ProfilePage {...props} />
    </>
  );
}

export default Profile;

export async function getServerSideProps(ctx) {
  const { username } = ctx.params;

  // get the currently logged in user
  const session = await getSession(ctx);
  const currentLoggedInUserName = session?.user?.name;

  // get the profile picture from the currently logged in user
  const [currentLoggedInUserError, currentLoggedInUserData] = await getUser(
    currentLoggedInUserName
  );

  if (currentLoggedInUserError) {
    console.log(currentLoggedInUserData);
    return { redirect: { destination: "/" } };
  }

  const currentLoggedInUserObj = {
    id: currentLoggedInUserData.id,
    username: currentLoggedInUserName,
  };

  // get the user object from the database
  const [userError, userData] = await getUser(username);
  if (userError) {
    console.log(userData);
    return { notFound: true };
  }

  const userObj = {
    id: userData.id,
    username: userData.username,
    name: userData.full_name,
    description: userData.description || "",
  };

  // get all posts associated with the user
  const [postsError, postsData] = await getUserPosts(userObj.id);
  if (postsError) {
    console.log(postsError);
    return { redirect: { destination: "/" } };
  }

  // check if like and comment data is allowed to be send to the client
  const posts = postsData.map((post) => {
    if (!post.allowLikes) delete post.likeCount;
    if (!post.allowComments) delete post.commentCount;
    return post;
  });

  // get all followers
  const [followersError, followersData] = await getFollowers(userObj.id);
  if (followersError) {
    console.log(followersData);
    return { redirect: { destination: "/" } };
  }

  // get all follows
  const [followsError, followsData] = await getFollows(userObj.id);
  if (followsError) {
    console.log(followsData);
    return { redirect: { destination: "/" } };
  }

  return {
    props: {
      user: userObj,
      posts: postsData,
      followers: followersData,
      follows: followsData,
      currentLoggedInUser: currentLoggedInUserObj,
    },
  };
}
