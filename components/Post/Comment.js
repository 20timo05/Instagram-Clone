import { useState } from "react";
import Link from "next/link";

import styles from "./comment.module.css";
import formatTime from "../../lib/formatTime";
import Heart from "../little/Heart";
import PopUp from "../PopUp";
import ShowUserListItem from "../little/ShowUserListItem";

import { fetchData } from "../../hooks/useFetch";
import ProfileImage from "../little/ProfileImage";

export default function Comment(props) {
  const {
    id,
    username,
    comment,
    setComments,
    created_at,
    currentLoggedInUser,
    responses,
    likes,
    isCaption = false,
    isResponse = false,
    writeResponseHandler,
    temporaryDeleteCommentHandler,
  } = props;

  const isLikedByCurrentLoggedInUser = !!likes?.find(
    (like) => like.username === currentLoggedInUser.username
  );

  const [showLikesUserModal, setShowLikesUserModal] = useState(false);

  const [responsesVisible, setResponsesVisible] = useState(false);

  const setLiked = async (isLiked) => {
    const { ok, data, error } = await fetchData(
      "PATCH",
      "/api/posts/setCommentLike",
      {
        ...(isResponse ? { comments_responses_id: id } : { comment_id: id }),
        isLiked,
      }
    );
    console.log(ok ? data : error);
    if (!ok) return;

    // change it temporary on the front end
    setComments((prev) => {
      const newComments = [...prev];
      // find this comment in the comments list
      let thisComment;
      if (!isResponse) {
        thisComment =
          newComments[newComments.findIndex((comment) => comment.id === id)];
      } else {
        for (let i = 0; i < newComments.length; i++) {
          thisComment = newComments[i].responses.find((res) => res.id === id);
          if (thisComment) break;
        }
      }
      if (isLiked) {
        if (!thisComment.likes.find((like) => like.id === 0)) {
          thisComment.likes.push({
            id: 0,
            username: currentLoggedInUser.username,
          });
        }
      } else {
        thisComment.likes = thisComment.likes.filter(
          (like) => like.username !== currentLoggedInUser.username
        );
      }

      return newComments;
    });
  };

  const deleteCommentHandler = async () => {
    const { ok, data, error } = await fetchData(
      "DELETE",
      "/api/posts/deleteComment",
      { isResponse, id }
    );
    console.log(ok ? data : error);

    temporaryDeleteCommentHandler(isResponse, id);
  };

  return (
    <section className={styles.wrapper}>
      <div>
        <Link href={`/${username}`}>
          <aside className={styles.profile_picture}>
            <ProfileImage
              username={username}
              height="40"
              width="40"
            />
          </aside>
        </Link>
        <section className={styles.comment}>
          <header>
            <Link href={`/${username}`}>
              <b>{username}</b>
            </Link>
            {comment}
          </header>

          {!isCaption && (
            <footer className={styles.footer}>
              <span>{formatTime(new Date(created_at))}</span>
              {likes?.length > 0 && (
                <span onClick={() => setShowLikesUserModal(true)}>
                  Gefällt {likes.length} Mal
                </span>
              )}
              {writeResponseHandler && (
                <span onClick={writeResponseHandler}>Antworten</span>
              )}
              {currentLoggedInUser.username === username && (
                <span onClick={deleteCommentHandler}>Löschen</span>
              )}
            </footer>
          )}

          {!isCaption && responses?.length > 0 && (
            <>
              <div
                className={styles.showResponses}
                onClick={() => setResponsesVisible((prev) => !prev)}
              >
                <div className={styles.verticalLine}></div>
                <span>
                  Antworten
                  {responsesVisible
                    ? " verbergen"
                    : ` anzeigen (${responses.length})`}
                </span>
              </div>
              {responsesVisible && (
                <section className={styles.responsesWrapper}>
                  {responses.map((response) => (
                    <Comment
                      key={response.id}
                      id={response.id}
                      username={response.username}
                      comment={response.commentResponse_text}
                      setComments={setComments}
                      likes={response.likes}
                      created_at={response.created_at}
                      isResponse={true}
                      currentLoggedInUser={currentLoggedInUser}
                      temporaryDeleteCommentHandler={
                        temporaryDeleteCommentHandler
                      }
                    />
                  ))}
                </section>
              )}
            </>
          )}
        </section>
        {!isCaption && (
          <Heart
            className={styles.heartWrapper}
            isLiked={isLikedByCurrentLoggedInUser}
            setLiked={setLiked}
          />
        )}
      </div>

      {/* show the users who liked this comment */}
      {showLikesUserModal && (
        <PopUp
          close={() => setShowLikesUserModal(false)}
          title={"„Gefällt mir“-Angaben"}
        >
          {likes.map((like) => (
            <ShowUserListItem
              key={like.id}
              {...like}
              currentLoggedInUser={currentLoggedInUser}
            />
          ))}
        </PopUp>
      )}
    </section>
  );
}
