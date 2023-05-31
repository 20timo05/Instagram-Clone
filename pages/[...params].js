import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import Head from "next/head";

import Header from "../components/Header/index";
import Post from "../components/Post/Post";
import styles from "../components/Post/post.module.css";

import useWindowSize from "../hooks/useWindowSize";
import useComments from "../hooks/useComments";
import useFetch, { fetchData } from "../hooks/useFetch";

import { getData as getUser } from "./api/user/getUser";
import { getData as getUserPosts } from "./api/posts/getUserPosts";
import { getData as getComments } from "./api/posts/getComments";
import { getData as getPeopleTags } from "./api/posts/getPeopleTags";

function PostPage(props) {
  const { user, post, comments, currentLoggedInUser } = props;

  const {
    commentsList,
    addTemporaryCommentHandler,
    deleteTemporaryCommentHandler,
  } = useComments(comments, currentLoggedInUser);

  const { width } = useWindowSize();
  const [onTop, setOnTop] = useState(false);
  useEffect(() => setOnTop(width - 450 - 200 < 350), [width]);

  // get follows of currentloggedInUser for <AlsoLikedByProfile_pictures /> (in <PostFooter />)
  const [follows, setFollows, followsLoading] = useFetch(
    "GET",
    "/api/user/getFollows/",
    {
      userId: props.currentLoggedInUser.id,
    },
    []
  );
  return (
    <>
      <Head>
        <title>{props.user.username}</title>
      </Head>
      <Header
        currentLoggedInUser={props.currentLoggedInUser}
        active="profile"
      ></Header>
      <section
        className={`${styles.outerWrapper} ${onTop ? styles.onTop : ""}`}
      >
        <div>
          <Post
            post_id={post.id}
            user_id={user.id}
            {...post}
            {...user}
            comments={commentsList}
            currentLoggedInUser={currentLoggedInUser}
            onTop={onTop}
            notAlone={false}
            addTemporaryCommentHandler={addTemporaryCommentHandler}
            temporaryDeleteCommentHandler={deleteTemporaryCommentHandler}
            follows={{ data: follows, loading: followsLoading }}
          />
        </div>
      </section>
    </>
  );
}

export default PostPage;

export async function getServerSideProps(ctx) {
  const [username, postIdStr] = ctx.params.params;
  const postId = parseInt(postIdStr);

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

  // get the user object from the database
  const [userError, userData] = await getUser(username);
  if (userError) {
    console.log(userData);
    return { redirect: { destination: "/" } };
  }

  const user = {
    id: userData.id,
    username: userData.username,
    name: userData.full_name,
  };

  // get all posts associated with the user
  const [postsError, postsData] = await getUserPosts(user.id);
  if (postsError) {
    console.log(postsData);
    return { redirect: { destination: "/" } };
  }

  // get the specific post
  const post = postsData.find((post) => post.id === postId);

  // if post does not exist redirect to 404 page
  if (!post)
    return {
      notFound: true,
    };

  // get all comments associated with the post
  const [commentsError, commentsData] = await getComments(post.id);
  if (commentsError) {
    console.log(commentsData);
    return { redirect: { destination: "/" } };
  }

  // get all people tags associated with the post
  const [peopleTagsError, peopleTagsData] = await getPeopleTags(post.photos.map((photo) => photo.id));
  if (peopleTagsError) {
    console.log(peopleTagsData);
    return { redirect: { destination: "/" } };
  }
  post.photos = post.photos.map((photo) => {
    const associatedPeopleTags = peopleTagsData.filter(
      (tag) => tag.photo_id === photo.id
    );
    return {
      ...photo,
      peopleTags: associatedPeopleTags || [],
    };
  });

  return {
    props: {
      user,
      post,
      comments: commentsData,
      currentLoggedInUser: {
        id: currentLoggedInUserData.id,
        username: currentLoggedInUser,
      },
    },
  };
}
