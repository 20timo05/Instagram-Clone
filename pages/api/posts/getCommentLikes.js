import executeQuery from "../../../database/executeQuery";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });

  const comments = JSON.parse(req.query.comments);
  // create array with all
  const commentsArray = comments.map(({ id }) => id);
  const responsesArray = comments.map(({ responses }) => responses).flat();
  
  // Bsp.: commentCount = 4 => "?, ?, ?, ?"
  const commentsArrayPlaceholders =
  commentsArray.map(() => "?").join(", ") || "-1";
  const responsesArrayPlaceholders =
  responsesArray.map(() => "?").join(", ") || "-1";

  // get comments
  const query = `
    SELECT
      comment_id,
      comments_responses_id,
      users.id,
      users.username
    FROM comments_likes
    INNER JOIN users
      ON comments_likes.user_id = users.id
    WHERE
      comment_id IN(${commentsArrayPlaceholders})
    OR
      comments_responses_id IN(${responsesArrayPlaceholders});
  `;

  const result = await executeQuery({
    query,
    values: [...commentsArray, ...responsesArray],
  });

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while executing query" });
    return;
  }

  const commentsWithLikes = comments.map((comment) => ({
    ...comment,
    likes: result.filter((like) => like.comment_id === comment.id),
    responses: comment.responses.map((responseId) => ({
      id: responseId,
      likes: result.filter((like) => like.comments_responses_id === responseId),
    })),
  }));

  res.status(200).json(commentsWithLikes);
}
