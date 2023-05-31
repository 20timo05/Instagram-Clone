import executeQuery from "../../../database/executeQuery";

export async function getData(postId) {
  // get caption of post (always displayed as first "comment")
  const captionQuery = `
    SELECT
      users.username,
      posts.caption AS comment,
      posts.created_at
    FROM posts
    INNER JOIN users
      ON users.id = posts.user_id
    WHERE posts.id = ?;
  `;
  const captionResult = await executeQuery({
    query: captionQuery,
    values: [postId],
  });
  const captionComment = {
    ...captionResult[0],
    isCaption: true,
    id: 0,
    responses: [],
  };

  // check if post has comments allowed
  const postsAllowedQuery = `
    SELECT
      (CASE WHEN allowComments = 1 THEN TRUE ELSE FALSE END) AS allowComments
    FROM posts
    WHERE id = ?;
  `;
  const postsAllowedResult = await executeQuery({
    query: postsAllowedQuery,
    values: [postId],
  });
  if (postsAllowedResult[0].allowComments === 0) {
    res.status(200).json(captionComment);
    return;
  }

  // get comments
  const query = `
    SELECT
      comments.id,
      users.username,
      comments.comment_text AS comment,
      comments.created_at
    FROM comments
    INNER JOIN users
      ON comments.user_id = users.id
    WHERE comments.post_id = ?
    ORDER BY (
      SELECT COUNT(*) FROM comments_likes
      WHERE comments_likes.comment_id = comments.id
    ) DESC;
  `;

  const result = await executeQuery({ query, values: [postId] });

  if (result.error) {
    console.log(result.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query" },
    ];
  }

  // get responses
  const responseQuery = `
    SELECT
      comments_responses.id,
      comments.id AS comment_id,
      users.username,
      comments_responses.commentResponse_text,
      comments_responses.created_at
    FROM comments_responses
    INNER JOIN users
      ON comments_responses.user_id = users.id
    INNER JOIN comments
      ON comments_responses.comment_id = comments.id
    WHERE comments.post_id = ?
  `;

  const responseResult = await executeQuery({
    query: responseQuery,
    values: [postId],
  });
  if (responseResult.error) {
    console.log(responseResult.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query" },
    ];
  }

  let comments = [captionComment, ...result];
  // insert responses
  comments = comments.map((comment) => {
    comment.responses =
      responseResult.filter(
        (responses) => responses.comment_id === comment.id
      ) || [];
    return comment;
  });

  return [false, JSON.parse(JSON.stringify(comments))];
}

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });

  const { postId } = req.query;
  const [error, data] = await getData(postId);

  if (error) res.status(data.code).json({ err: data.err})
  res.status(200).json(data);
}
