import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { authOptions } from "./api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";

import Header from "../components/Header/index";
import Post from "../components/Post/Post";
import styles from "../components/Post/post.module.css";

import useLazyLoad from "../hooks/useLazyLoad";
import useFetch, { fetchData } from "../hooks/useFetch";

import { getData as getUser } from "./api/user/getUser";
import { getData as getFollowsPosts } from "./api/posts/getFollowsPosts";
import { getData as getPeopleTags } from "./api/posts/getPeopleTags";

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);

  const allPostsLoaded = useRef(false);
  const postWrapperRef = useRef(null);

  const fetchNewPosts = async () => {
    const lazyLoadIteration = Math.ceil(posts.length / 10);
    const res = await fetchData("GET", `/api/posts/getFollowsPosts`, {
      userId: props.currentLoggedInUser.id,
      lazyLoadIteration,
    });

    if (!res.ok) return console.log(res.error);

    setPosts((prev) => {
      if (!prev.includes(res.data[0])) return [...prev, ...res.data];
      return prev;
    });
    if (res.data.length < 10) {
      allPostsLoaded.current = true;
    }
  };

  // if the second last option which is loaded is visible to the user
  // => already lazy load the next 10 searchOptions
  const [secondLastOption, setSecondLastOption] = useState(null);
  useEffect(() => {
    if (!postWrapperRef?.current) return;
    const postsRefArr = postWrapperRef.current?.childNodes;
    setSecondLastOption(postsRefArr[postsRefArr?.length - 2]);
  }, [postWrapperRef, posts]);

  useLazyLoad(secondLastOption, () => {
    if (!allPostsLoaded.current) fetchNewPosts();
  });

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
        <title>Home</title>
      </Head>
      <Header currentLoggedInUser={props.currentLoggedInUser} active="home" />
      <section
        className={`${styles.outerWrapper} ${styles.onTop}`}
        ref={postWrapperRef}
      >
        {posts.map((post) => (
          <div key={post.post_id}>
            <Post
              {...post}
              currentLoggedInUser={props.currentLoggedInUser}
              onTop={true}
              notAlone={true}
              follows={{ data: follows, loading: followsLoading }}
            />
          </div>
        ))}
      </section>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const currentLoggedInUser = session?.user?.name;
  
  // get the id from the currently logged in user
  const [currentLoggedInUserError, currentLoggedInUserData] = await getUser(
    currentLoggedInUser
  );
  if (currentLoggedInUserError) {
    console.log(currentLoggedInUserData);
    return { redirect: { destination: "/auth/login/" } };
  }

  let [postsError, postsData] = await getFollowsPosts(
    currentLoggedInUserData.id
  );
  if (postsError) {
    console.log(postsData);
    return { redirect: { destination: "/auth/login" } };
  }
  if (postsData.length === 0) {
    return { redirect: { destination: "/recommendations" } };
  }

  postsData = postsData.map((post) => {
    if (!post.allowLikes) delete post.likeCount;
    if (!post.allowComments) delete post.commentCount;
    return post;
  });

  for (let i = 0; i < postsData.length; i++) {
    // get all people tags associated with the post
    const [peopleTagsError, peopleTagsData] = await getPeopleTags(
      postsData[i].photos.map((photo) => photo.id)
    );
    if (peopleTagsError) {
      console.log(peopleTagsData);
      return { redirect: { destination: "/" } };
    }

    postsData[i].photos = postsData[i].photos.map((photo) => {
      const associatedPeopleTag = peopleTagsData.find(
        (tag) => tag.photo_id === photo.id
      );
      return {
        ...photo,
        peopleTags: associatedPeopleTag || [],
      };
    });
  }

  return {
    props: {
      posts: postsData,
      currentLoggedInUser: {
        id: currentLoggedInUserData.id,
        username: currentLoggedInUser,
      },
    },
  };
}
