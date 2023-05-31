import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "This method requires POST!" });

  const username = await requireAuth(req, res);
  if (!username) return;

  const { postId, comment, responseMode, commentId } = req.body;

  // create comment/ response
  let result;
  let getInsertedCommentIdQuery;
  if (responseMode) {
    const createResponseQuery = `
    INSERT INTO comments_responses (
      commentResponse_text,
      comment_id,
      user_id
    )
    VALUES (
      ?,
      ?,
      (SELECT id FROM users WHERE username=?)
    );
  `;
    result = await executeQuery({
      query: createResponseQuery,
      values: [comment, commentId, username],
    });

    getInsertedCommentIdQuery = `
      SELECT id FROM comments_responses
      ORDER BY created_at DESC
      LIMIT 1
    `;
  } else {
    const createCommentQuery = `
    INSERT INTO comments (
      comment_text,
      post_id,
      user_id
    )
    VALUES (
      ?,
      ?,
      (SELECT id FROM users WHERE username=?)
    );
  `;
    result = await executeQuery({
      query: createCommentQuery,
      values: [comment, postId, username],
    });

    getInsertedCommentIdQuery = `
      SELECT id FROM comments
      ORDER BY created_at DESC
      LIMIT 1
    `;
  }

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while creating comment!" });
    return;
  }

  const getInsertedCommentIdResult = await executeQuery({
    query: getInsertedCommentIdQuery,
    values: [],
  });

  if (getInsertedCommentIdResult.error) {
    console.log(result.error);
    res
      .status(500)
      .json({ err: "An Error occurred while retrieving comment id!" });
    return;
  }

  res.status(200).json({
    message: `${responseMode ? "Response" : "Comment"} created successfully`,
    id: getInsertedCommentIdResult[0].id,
  });
}
