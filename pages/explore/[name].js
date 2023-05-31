import { useState, useEffect, useRef } from "react";
import { getSession } from "next-auth/react";
import Head from "next/head";

import styles from "../../components/Profile/profile.module.css";
import Header from "../../components/Header/index";
import ProfileImage from "../../components/little/ProfileImage";
import PostPreview from "../../components/Profile/PostPreview";

import useLazyLoad from "../../hooks/useLazyLoad";
import { fetchData } from "../../hooks/useFetch";

import { getData as getUser } from "../api/user/getUser";
import { getData as getTagsPosts } from "../api/posts/getTagsPosts";
import { getData as getLocationPosts } from "../api/posts/getLocationPosts";

function TagPage({
  type,
  name,
  currentLoggedInUser,
  postsData,
  postsCount,
  lat,
  lng,
}) {
  const wrapperRef = useRef(null);
  const [posts, setPosts] = useState(postsData);
  const [lazyLoadIteration, setLazyLoadIteration] = useState(0);
  const allPostsLoaded = postsCount < 10 * (lazyLoadIteration + 1);

  const fetchNewPosts = async () => {
    const posts = await fetchData("GET", `/api/posts/getTagsPosts`, {
      tagname: name,
      lazyLoadIteration: lazyLoadIteration + 1,
    });
    setLazyLoadIteration((prev) => prev + 1);
    setPosts((prev) => [...prev, ...posts.data.postsData]);
  };

  const [secondLastPost, setSecondLastPost] = useState(null);
  useEffect(() => {
    if (!wrapperRef?.current) return;
    const postsRefArr = wrapperRef.current?.childNodes;
    setSecondLastPost(postsRefArr[postsRefArr?.length - 2]);
  }, [wrapperRef, posts]);

  useLazyLoad(secondLastPost, () => {
    if (!allPostsLoaded.current) fetchNewPosts();
  });

  useEffect(() => {
    setLazyLoadIteration(0);
    setPosts(postsData);
  }, [postsData]);

  return (
    <>
      <Head>
        <title>{`${type === "tag" ? "#" : ""}${name}`}</title>
      </Head>
      <Header
        currentLoggedInUser={currentLoggedInUser}
        active="profile"
      ></Header>
      <div className={styles.wrapper}>
        <section className={styles.section}>
          <header className={styles.header}>
            <ProfileImage
              src={posts[0].photos[0].image_url}
              height="150"
              width="150"
            />
            <aside style={{ width: "50%" }}>
              {type === "location" ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  style={{ textDecoration: "none" }}
                >
                  <div className={styles.locationHeader}>
                    <i className="fa-solid fa-location-dot"></i>
                    <h1>{name}</h1>
                  </div>
                  <span>
                    {lat}, {lng}
                  </span>
                </a>
              ) : (
                <h1>#{name}</h1>
              )}
              <h4>
                <b>{postsCount}</b> {postsCount === 1 ? "Beitrag" : "Beiträge"}
              </h4>
            </aside>
          </header>
          <section className={styles.postsGrid} ref={wrapperRef}>
            {posts.map((post) => (
              <PostPreview key={post.id} post={post} username={post.username} />
            ))}
          </section>
        </section>
      </div>
    </>
  );
}

export default TagPage;

export async function getServerSideProps(ctx) {
  const { name } = ctx.params;
  const { type } = ctx.query;

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

  let posts;
  if (type === "tag") posts = await getTagsPosts(name);
  else if (type === "location") posts = await getLocationPosts(name);
  else return { notFound: true };

  if (posts[0]) return { redirect: { destination: "/" } };

  if (posts[1].postsCount === 0) return { notFound: true };
  return {
    props: {
      name,
      currentLoggedInUser: currentLoggedInUserObj,
      postsData: posts[1].postsData,
      postsCount: posts[1].postsCount,
      lat: posts[1].lat || null,
      lng: posts[1].lng || null,
      type,
    },
  };
}
