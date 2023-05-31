import { useState } from "react"

export default function useComments(comments, currentLoggedInUser) {
  const [commentsList, setCommentsList] = useState(comments);

  const addTemporaryCommentHandler = (responseMode, id, commentText) => {
    const commentObj = {
      id,
      ...(responseMode && { comment_id: responseMode.commentId }),
      username: currentLoggedInUser.username,
      isCaption: false,
      commentResponse_text: commentText,
      ...(responseMode
        ? { commentResponse_text: commentText }
        : { comment: commentText }),
      created_at: new Date(),
      responses: [],
    };
    if (!responseMode) {
      setCommentsList((prev) => [...prev, commentObj]);
    } else {
      setCommentsList((prev) => {
        const newCommentsList = [...prev];
        const commentIdx = newCommentsList.findIndex(
          (comment) => comment.id === responseMode.commentId
        );
        newCommentsList[commentIdx].responses.push(commentObj);
        return newCommentsList;
      });
    }
  };

  const deleteTemporaryCommentHandler = (isResponse, id) => {
    if (!isResponse) {
      setCommentsList((prev) => prev.filter((comment) => comment.id !== id));
    } else {
      setCommentsList((prev) =>
        prev.map((comment) => ({
          ...comment,
          responses: comment.responses.filter((response) => response.id !== id),
        }))
      );
    }
  };

  return {
    commentsList,
    addTemporaryCommentHandler,
    deleteTemporaryCommentHandler,
  };
}
