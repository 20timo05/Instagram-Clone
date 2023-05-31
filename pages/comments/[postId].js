import { getSession } from "next-auth/react";
import Head from "next/head";

import CommentsPage from "../../components/Post/CommentsPage";
import Header from "../../components/Header/index";

import useComments from "../../hooks/useComments";
import { fetchData } from "../../hooks/useFetch";

import { getData as getUser } from "../api/user/getUser";
import { getData as getComments } from "../api/posts/getComments";

function PostPage(props) {
  const { postId, comments, currentLoggedInUser } = props;
  const {
    commentsList,
    addTemporaryCommentHandler,
    deleteTemporaryCommentHandler,
  } = useComments(comments, currentLoggedInUser);

  return (
    <>
      <Head>
        <title>Kommentare</title>
      </Head>
      <Header
        currentLoggedInUser={props.currentLoggedInUser}
        active="profile"
      ></Header>
      <CommentsPage
        comments={commentsList}
        postId={postId}
        addTemporaryCommentHandler={addTemporaryCommentHandler}
        currentLoggedInUser={currentLoggedInUser}
        temporaryDeleteCommentHandler={deleteTemporaryCommentHandler}
      />
    </>
  );
}

export default PostPage;

export async function getServerSideProps(ctx) {
  const { postId } = ctx.params;

  // get the current logged in user
  const session = await getSession(ctx);
  const currentLoggedInUser = session?.user?.name;

  // get the profile picture from the currently logged in user
  const [currentLoggedInUserError, currentLoggedInUserData] = await getUser(
    currentLoggedInUser
  );
  if (currentLoggedInUserError) {
    console.log(currentLoggedInUserData);
    return { redirect: { destination: "/" } };
  }

  // get all comments associated with the post
  const [commentsError, commentsData] = await getComments(postId);
  if (commentsError) {
    console.log(commentsData);
    return { redirect: { destination: "/" } };
  }

  return {
    props: {
      postId,
      comments: commentsData,
      currentLoggedInUser: {
        id: currentLoggedInUserData.id,
        username: currentLoggedInUser,
      },
    },
  };
}
