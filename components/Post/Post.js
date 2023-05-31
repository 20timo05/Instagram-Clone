import { useEffect, useState } from "react";
import Head from "next/head";

import styles from "./post.module.css";
import PostImageSlider from "./PostImageSlider";
import PostHeader from "./PostHeader";
import CommentSection from "./CommentSection";
import PostFooter from "./PostFooter";

export default function Post(props) {
  const [responseMode, setResponseMode] = useState(false);
  const writeResponseHandler = (commentId) => {
    // username of the person which the current logged in user responses to
    const commentUsername = props.comments.find(
      (comment) => comment.id === commentId
    ).username;

    setResponseMode({ commentId, username: commentUsername });
  };

  const [windowObj, setWindowObj] = useState();
  useEffect(() => setWindowObj(window), []);

  return (
    <>
      {windowObj && (
        <Head>
          <meta property="og:url" content={windowObj.location.href} />
          <meta
            property="og:image"
            content={windowObj.origin + props.photos[0].image_url}
          />
          <meta property="og:description" content={props.caption} />
        </Head>
      )}
      {props.onTop && (
        <PostHeader
          id={props.user_id}
          username={props.username}
          currentLoggedInUser={props.currentLoggedInUser.username}
          onTop={true}
          notAlone={props.notAlone || false}
          post_id={props.post_id}
          allowComments={props.allowComments}
          allowLikes={props.allowLikes}
          location={props.location}
          lat={props.lat}
          lng={props.lng}
        />
      )}
      <PostImageSlider photos={props.photos} onTop={props.onTop} />
      <aside className={`${styles.side} ${props.onTop ? styles.onTop : ""}`}>
        {!props.onTop && (
          <PostHeader
            id={props.user_id}
            username={props.username}
            currentLoggedInUser={props.currentLoggedInUser.username}
            onTop={false}
            post_id={props.post_id}
            allowComments={props.allowComments}
            allowLikes={props.allowLikes}
            location={props.location}
            lat={props.lat}
            lng={props.lng}
          />
        )}
        {!props.onTop && (
          <CommentSection
            allowComments={props.allowComments}
            comments={props.comments}
            writeResponseHandler={writeResponseHandler}
            currentLoggedInUser={props.currentLoggedInUser}
            temporaryDeleteCommentHandler={props.temporaryDeleteCommentHandler}
          />
        )}
        <PostFooter
          post_id={props.post_id}
          username={props.username}
          created_at={props.created_at}
          follows={props.follows}
          allowComments={props.allowComments}
          allowLikes={props.allowLikes}
          likeCount={props.likeCount}
          currentLoggedInUser={props.currentLoggedInUser}
          addTemporaryCommentHandler={props.addTemporaryCommentHandler}
          onTop={props.onTop}
          commentCount={props.commentCount}
          responseMode={responseMode}
          setResponseMode={setResponseMode}
          isSaved={props.isSaved}
        />
      </aside>
    </>
  );
}
