import { useState, useEffect } from "react";

import Comment from "./Comment";

import useFetch from "../../hooks/useFetch";

export default function CommentSection({
  comments,
  writeResponseHandler,
  currentLoggedInUser,
  temporaryDeleteCommentHandler,
}) {
  const [commentsWithLikes, setCommentsWithLikes] = useState(comments);

  const [, , loading] = useFetch(
    "GET",
    `/api/posts/getCommentLikes/`,
    {
      comments: JSON.stringify(
        comments.map((comment) => ({
          id: comment.id,
          responses: comment.responses.map(({ id }) => id),
        }))
      ),
    },
    [],
    ({ data }) => {
      setCommentsWithLikes((prev) => {
        const newComments = [...prev];
        for (let i = 0; i < newComments.length; i++) {
          // get likes for this comment from fetched like data
          const likeData = data.find((like) => newComments[i].id === like.id);
          // remove unnecessary information
          const filteredLikeData = likeData.likes.map((like) => ({
            id: like.id,
            username: like.username,
          }));
          newComments[i].likes = filteredLikeData;

          // get likes for the responses of this comment from fetched like data
          for (let j = 0; j < newComments[i].responses.length; j++) {
            const response = newComments[i].responses[j];
            const responseLikeData = likeData.responses.find(
              (likeDataOfResponse) => likeDataOfResponse.id === response.id
            );
            const filteredResponseLikeData = responseLikeData.likes.map(
              (responseLike) => ({
                id: responseLike.id,
                username: responseLike.username,
              })
            );
            response.likes = filteredResponseLikeData;
          }
        }

        return newComments;
      });
    }
  );

  useEffect(() => {
    if (loading) return;

    setCommentsWithLikes((prev) => {
      const newCommentsWithLikes = [...comments];
      for (let i = 0; i < comments.length; i++) {
        // get likes
        const correspondingCommentWithLike = prev.find(
          (commentWithLike) => commentWithLike.id === comments[i].id
        );
        if (!correspondingCommentWithLike) continue;

        newCommentsWithLikes[i].likes = correspondingCommentWithLike.likes;

        // get likes for responses
        for (let j = 0; j < comments[i].responses.length; j++) {
          const correspondingResponseWithLike =
            correspondingCommentWithLike.responses.find(
              (responseWithLike) =>
                responseWithLike.id === comments[i].responses[j].id
            );
            console.log(correspondingResponseWithLike)
          if (!correspondingResponseWithLike) continue;

          newCommentsWithLikes[i].responses[j].likes =
            correspondingResponseWithLike.likes;
        }
      }

      return newCommentsWithLikes
    });
  }, [comments]);

  return (
    <>
      <style jsx>{`
        .commentSection {
          height: 100%;
          position: relative;
          overflow: auto;
          -ms-overflow-style: none;
          scrollbar-width: none;
          padding-top: 20px;
        }

        .commentSection::-webkit-scrollbar {
          display: none;
        }

        .fallback {
          height: 100%;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          font-weight: lighter;
        }

        .fallback > h1 {
          font-size: 1.5rem;
          margin-bottom: 10px;
        }
      `}</style>
      <section className="commentSection">
        {comments.length === 0 ? (
          <div className="fallback">
            <h1>Noch keine Kommentare.</h1>
            <span>Beginne die Unterhaltung</span>
          </div>
        ) : (
          commentsWithLikes.map((comment) => (
            <Comment
              key={comment.id}
              {...comment}
              setComments={setCommentsWithLikes}
              writeResponseHandler={() => writeResponseHandler(comment.id)}
              currentLoggedInUser={currentLoggedInUser}
              temporaryDeleteCommentHandler={temporaryDeleteCommentHandler}
            />
          ))
        )}
      </section>
    </>
  );
}
