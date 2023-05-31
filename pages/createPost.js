import { getSession } from "next-auth/react";
import Head from "next/head";

import Header from "../components/Header/index";
import CreatePostPage from "../components/createPost/CreatePostPage";

import { getData as getUser } from "./api/user/getUser";

function PostPage({ currentLoggedInUser }) {
  return (
    <>
      <Head>
        <title>Erstelle einen Beitrag</title>
      </Head>
      <Header
        currentLoggedInUser={currentLoggedInUser}
        active="create"
      ></Header>
      <CreatePostPage currentLoggedInUser={currentLoggedInUser} />
    </>
  );
}

export default PostPage;

export async function getServerSideProps(ctx) {
  // get the current logged in user
  const session = await getSession(ctx);
  const currentLoggedInUser = session?.user?.name;

  // get the profile picture from the currently logged in user
  const [userError, userData] = await getUser(currentLoggedInUser);
  if (userError) {
    console.log(userData);
    return { redirect: { destination: "/" } };
  }

  return {
    props: {
      currentLoggedInUser: {
        id: userData.id,
        username: currentLoggedInUser,
      },
    },
  };
}
