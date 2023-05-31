import { useState, useMemo } from "react";
import Link from "next/link";

import styles from "./postFooter.module.css";
import WriteComment from "./WriteComment";
import Heart from "../little/Heart";
import AlsoLikedByProfile_pictures from "../little/AlsoLikedByProfile_pictures";
import formatTime from "../../lib/formatTime";
import getFollowsOfLikers from "../../lib/getFollowsOfLikers";
import PopUp from "../PopUp";
import ShowUserListItem from "../little/ShowUserListItem";

import useFetch, { fetchData } from "../../hooks/useFetch";

export default function PostFooter(props) {
  const [toggleSave, setToggleSave] = useState(props.isSaved);

  // find out if logged in user follows any of the other people liking the post
  const [likes, setLikes, likesLoading] = useFetch(
    "GET",
    "/api/posts/getLikes",
    { postId: props.post_id },
    []
  );
  const isLikedByCurrentlyLoggedInUser = likes.find(
    (like) => like.username === props.currentLoggedInUser.username
  );

  // for <AlsoLikedByProfile_pictures />
  // (memoize, so alsoLikedBy does not recalculate and therefore change on every like toggle by currentloggedinuser)
  const alsoLikedBy = useMemo(
    () => getFollowsOfLikers(props.follows.data, likes) || [],
    [props.follows.loading, likesLoading]
  );

  const [showLikesUserModal, setShowLikesUserModal] = useState(false);

  const setLikeHandler = async (value) => {
    // change it locally so it immediately shows up
    if (value) {
      setLikes((prev) => [...prev, props.currentLoggedInUser]);
    } else {
      setLikes((prev) =>
        prev.filter(
          (like) => like.username !== props.currentLoggedInUser.username
        )
      );
    }

    // store it in database
    const { ok, data, error } = await fetchData(
      "PATCH",
      "/api/posts/setPostLike",
      {
        post_id: props.post_id,
        isLiked: value,
      }
    );
    console.log(ok ? data : error);
  };

  const setSaveHandler = async (value) => {
    setToggleSave(value);

    // store in database
    const { ok, data, error } = await fetchData(
      "PATCH",
      "/api/posts/setPostSave",
      {
        post_id: props.post_id,
        isSaved: value,
      }
    );
    console.log(ok ? data : error);
  };

  return (
    <>
      <footer className={`${styles.footer} ${props.onTop ? styles.onTop : ""}`}>
        <header>
          {!!props.allowLikes && (
            <Heart
              isLiked={isLikedByCurrentlyLoggedInUser}
              setLiked={setLikeHandler}
            />
          )}
          {!!props.allowComments && (
            <Link href={`comments/${props.post_id}`}>
              <i className="fa-regular fa-comment"></i>
            </Link>
          )}
          <i className="fa-regular fa-paper-plane"></i>

          <span onClick={() => setSaveHandler(!toggleSave)}>
            {toggleSave ? (
              <i className="fa-solid fa-bookmark"></i>
            ) : (
              <i className="fa-regular fa-bookmark"></i>
            )}
          </span>
        </header>
        <section>
          {!!props.allowLikes && (
            <div
              className={styles.likes}
              onClick={() => setShowLikesUserModal(true)}
            >
              {alsoLikedBy[1] ? (
                <>
                  <AlsoLikedByProfile_pictures users={alsoLikedBy[0]} />
                  Gefällt {alsoLikedBy[1]} und{" "}
                  {likes.length - 1 || props.likeCount - 1} weiteren Personen
                </>
              ) : (
                <>Gefällt {likes.length || props.likeCount} Mal</>
              )}
            </div>
          )}
          <span>{formatTime(new Date(props.created_at))}</span>
        </section>
        {props.onTop && !!props.allowComments && (
          <Link
            href={`comments/${props.post_id}`}
            className={styles.showComments}
          >
            Alle {props.commentCount} Kommentare ansehen
          </Link>
        )}
        {!!props.allowComments && (
          <WriteComment
            postId={props.post_id}
            addTemporaryCommentHandler={props.addTemporaryCommentHandler}
            responseMode={props.responseMode}
            setResponseMode={props.setResponseMode}
          />
        )}
      </footer>

      {/* show the users who liked this post */}
      {showLikesUserModal && (
        <PopUp
          close={() => setShowLikesUserModal(false)}
          title={"„Gefällt mir“-Angaben"}
        >
          {likes.map((like) => (
            <ShowUserListItem
              key={like.id}
              {...like}
              currentLoggedInUser={props.currentLoggedInUser}
            />
          ))}
        </PopUp>
      )}
    </>
  );
}
