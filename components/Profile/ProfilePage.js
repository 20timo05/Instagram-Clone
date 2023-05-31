import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

import styles from "./profile.module.css";
import PostPreview from "./PostPreview";
import PopUp from "../PopUp";
import EditProfile from "./EditProfile";
import ShowUserListItem from "../little/ShowUserListItem";
import ProfileImage from "../little/ProfileImage";
import OptionsSlider from "../little/OptionsSlider";
import LoadingAnimation from "../little/LoadingAnimation";

import useWindowSize from "../../hooks/useWindowSize";
import useToggleFollow from "../../hooks/useToggleFollow";
import { fetchData } from "../../hooks/useFetch";

export default function Profile(props) {
  const { id, username, name, description } = props.user;
  const { followers, follows, posts: ownPosts, currentLoggedInUser } = props;

  const [followStatus, toggleFollow] = useToggleFollow(
    id,
    currentLoggedInUser.username
  );

  const { width } = useWindowSize();
  const wideScreen = width > 768;

  const [followersModal, setFollowersModal] = useState(false);
  const [followsModal, setFollowsModal] = useState(false);
  const [editProfileModal, setEditProfileModal] = useState(false);

  const [posts, setPosts] = useState(ownPosts);
  const [bookMarkPosts, setBookMarkPosts] = useState(null);
  const [taggedPosts, setTaggedPosts] = useState(null);
  const [type, setType] = useState("Beiträge");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPosts(ownPosts);
    setType("Beiträge");
  }, [username]);

  const loadOtherOptionsHandler = async ([, optionIdx]) => {
    if (optionIdx === 0) {
      setType("Beiträge");
      setPosts(ownPosts);
    } else if (optionIdx === 1) {
      setType("Gespeichert");
      if (bookMarkPosts) return setPosts(bookMarkPosts);
      setLoading(true);
      const { ok, data, error } = await fetchData(
        "GET",
        "/api/posts/getSavedPosts"
      );
      if (!ok) return console.error(error);
      setBookMarkPosts(data);
      setPosts(data);
      setLoading(false);
    } else {
      setType("Markiert");
      if (taggedPosts) return setPosts(taggedPosts);
      setLoading(true);
      const { ok, data, error } = await fetchData(
        "GET",
        "/api/posts/getPeopleTaggedPosts"
      );
      if (!ok) return console.error(error);
      setTaggedPosts(data);
      setPosts(data);
      setLoading(false);
    }
  };

  const statsSection = (
    <section className={styles.stats}>
      <span>
        <b>{posts.length}</b> {posts.length === 1 ? "Beitrag" : "Beiträge"}
      </span>
      <span onClick={() => setFollowersModal((prev) => !prev)}>
        <b>{followers.length}</b> Follower
      </span>
      <span onClick={() => setFollowsModal((prev) => !prev)}>
        <b>{follows.length}</b> abonniert
      </span>
    </section>
  );

  const descriptionWrapper = (
    <footer>
      <h3>{name}</h3>
      <ul className={styles.descriptionUl}>
        {description.split("\n").map((row, idx) => (
          <li key={idx}>
            {row} <br />
          </li>
        ))}
      </ul>
    </footer>
  );

  return (
    <>
      <div className={styles.wrapper}>
        <section className={styles.section}>
          <header className={styles.header}>
            <ProfileImage username={username} height="150" width="150" />
            <aside className={styles.aside}>
              <header>
                <h2>{username}</h2>
                {username === currentLoggedInUser.username ? (
                  <>
                    <button onClick={() => setEditProfileModal(true)}>
                      Profil bearbeiten
                    </button>
                    <Link href="/createPost">
                      <button>Beitrag erstellen</button>
                    </Link>
                    <button onClick={signOut}>Abmelden</button>
                  </>
                ) : followStatus ? (
                  <button onClick={toggleFollow}>Gefolgt</button>
                ) : (
                  <button className={styles.follow} onClick={toggleFollow}>
                    Folgen
                  </button>
                )}
              </header>
              {wideScreen && statsSection}
              {wideScreen && descriptionWrapper}
            </aside>
          </header>
          {!wideScreen && descriptionWrapper}
          {!wideScreen && statsSection}

          {username === currentLoggedInUser.username ? (
            <OptionsSlider
              options={[
                <>
                  <i className="fa-solid fa-table-cells"></i> Beiträge
                </>,
                <>
                  <i className="fa-regular fa-bookmark"></i> Gespeichert
                </>,
                <>
                  <i className="fa-solid fa-user-tag"></i> Markiert
                </>,
              ]}
              onClick={loadOtherOptionsHandler}
            />
          ) : (
            wideScreen && <hr />
          )}
          {loading ? (
            <LoadingAnimation />
          ) : posts.length > 0 ? (
            <section className={styles.postsGrid}>
              {posts.map((post) => (
                <PostPreview
                  key={post.id}
                  post={post}
                  username={type === "Beiträge" ? username : post.username}
                />
              ))}
            </section>
          ) : (
            <section className={styles.defaultText}>
              {type === "Beiträge" && <i className="fa-solid fa-camera"></i>}
              {type === "Gespeichert" && (
                <i className="fa-regular fa-bookmark"></i>
              )}
              {type === "Markiert" && (
                <i className={`fa-solid fa-user-tag ${styles.userTag}`}></i>
              )}
              <h1>
                {type === "Beiträge" && "Fotos teilen"}
                {type === "Gespeichert" && "Gespeicherte Fotos"}
                {type === "Markiert" && "Fotos von dir"}
              </h1>
              <p>
                {type === "Beiträge" &&
                  "Wenn du Fotos teilst, erscheinen sie in deinem Profil."}
                {type === "Gespeichert" &&
                  "Hier findest du deine gespeicherten Fotos."}
                {type === "Markiert" &&
                  "Hier findest du Fotos, in denen du markiert wurdest."}
              </p>
            </section>
          )}
        </section>
      </div>
      {followersModal && (
        <PopUp
          title="Followers"
          close={() => setFollowersModal(false)}
          closeOnClick={true}
        >
          {followers.map((follower) => (
            <ShowUserListItem
              key={follower.id}
              {...follower}
              currentLoggedInUser={currentLoggedInUser}
            />
          ))}
        </PopUp>
      )}
      {followsModal && (
        <PopUp
          title="abonniert"
          close={() => setFollowsModal(false)}
          closeOnClick={true}
        >
          {follows.map((follow) => (
            <ShowUserListItem
              key={follow.id}
              {...follow}
              currentLoggedInUser={currentLoggedInUser}
            />
          ))}
        </PopUp>
      )}
      {editProfileModal && (
        <EditProfile
          close={() => setEditProfileModal(false)}
          currentLoggedInUser={currentLoggedInUser}
        />
      )}
    </>
  );
}
