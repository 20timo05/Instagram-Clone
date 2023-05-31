import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export default async function handler(req, res) {
  if (req.method !== "PATCH")
    return res.status(405).json({ error: "This method requires PATCH!" });

  const username = await requireAuth(req, res);
  if (!username) return;

  const { post_id, isSaved } = req.body;

  // create
  let saveQuery;

  if (isSaved) {
    saveQuery = `
      INSERT INTO saved_posts (
        user_id,
        post_id
      )
      VALUES (
        (SELECT id FROM users WHERE username=?),
        ?
      )`;
  } else {
    saveQuery = `
      DELETE FROM saved_posts
      WHERE
        user_id=(SELECT id FROM users WHERE username=?)
      AND
        post_id=?
    `;
  }

  const result = await executeQuery({
    query: saveQuery,
    values: [username, post_id],
  });

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while updating save!" });
    return;
  }

  res
    .status(200)
    .json({
      message: `Post ${isSaved ? "added" : "removed"} from saved posts!`,
    });
}
