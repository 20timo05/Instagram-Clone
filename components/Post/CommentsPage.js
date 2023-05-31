import { useRouter } from "next/router";
import { useState } from "react";

import styles from "./commentsPage.module.css";
import CommentSection from "./CommentSection";
import WriteComment from "./WriteComment";

export default function CommentsPage({
  comments,
  postId,
  addTemporaryCommentHandler,
  currentLoggedInUser,
  temporaryDeleteCommentHandler
}) {
  const router = useRouter();
  const [responseMode, setResponseMode] = useState(false);

  const writeResponseHandler = (commentId) => {
    // username of the person which the current logged in user responses to
    const commentUsername = comments.find(
      (comment) => comment.id === commentId
    ).username;

    setResponseMode({ commentId, username: commentUsername });
  };

  return (
    <section className={styles.outerWrapper}>
      <header className={styles.header}>
        <i
          onClick={() => router.back()}
          className="fa-solid fa-arrow-left-long"
        ></i>
        <b>Kommentare</b>
        <i className="fa-regular fa-paper-plane"></i>
      </header>
      <CommentSection
        comments={comments}
        writeResponseHandler={writeResponseHandler}
        currentLoggedInUser={currentLoggedInUser}
        temporaryDeleteCommentHandler={temporaryDeleteCommentHandler}
      />
      <WriteComment
        postId={postId}
        addTemporaryCommentHandler={addTemporaryCommentHandler}
        responseMode={responseMode}
        setResponseMode={setResponseMode}
      />
    </section>
  );
}
