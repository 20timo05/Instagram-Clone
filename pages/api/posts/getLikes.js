import executeQuery from "../../../database/executeQuery";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ err: "This method requires GET!" });

  const { postId } = req.query;

  // check if post has likes allowed
  const postsAllowedQuery = `
    SELECT
      (CASE WHEN allowLikes = 1 THEN TRUE ELSE FALSE END) AS allowLikes
    FROM posts
    WHERE id = ?;
  `;
  const postsAllowedResult = await executeQuery({
    query: postsAllowedQuery,
    values: [postId],
  });
  if (postsAllowedResult[0].allowLikes === 0) {
    res.status(401).json({ err: "Likes are not available for this post!" });
    return;
  }

  const query = `
    SELECT
      users.id,
      users.username,
      likes.created_at
    FROM likes
    INNER JOIN users
      ON likes.user_id = users.id
    WHERE likes.post_id = ?
  `;

  const result = await executeQuery({ query, values: [postId] });

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while executing query" });
    return;
  }

  res.status(200).json(result);
}
