import executeQuery from "../../../database/executeQuery";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });

  const { postId } = req.query;
  const postQuery = `
    SELECT
      posts.id,
      posts.caption,
      username,
      CONCAT("/api/getFiles/getPostPhoto/", username, "/", posts.id, "_0.jpg") AS image_url,
      alternativeText,
      COUNT(photos.id) photo_count
    FROM posts
    INNER JOIN users
      ON posts.user_id = users.id
    INNER JOIN photos
      ON photos.post_id = posts.id
    WHERE
      posts.id = ?
    ORDER BY photos.position
    LIMIT 1;
  `;

  const postResult = await executeQuery({
    query: postQuery,
    values: [postId],
  });

  if (postResult.error) {
    console.log(postResult.error);
    return res.status(500).json({ err: "An Error occurred while executing query" });
  }

  res.status(200).json(postResult[0]);
}
