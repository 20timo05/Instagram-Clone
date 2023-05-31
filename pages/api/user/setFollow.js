import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "This method requires POST!" });

  const username = await requireAuth(req, res);
  if (!username) return;

  const { followId, followStatus } = req.body;

  let result;
  if (followStatus) {
    // create follow
    const query = `
    INSERT INTO follows (follower_id, followee_id)
    VALUES (
      (SELECT id FROM users WHERE username = ?),
      ?
    );
    `;
    result = await executeQuery({
      query,
      values: [username, followId],
    });
  } else {
    const query = `
      DELETE FROM FOLLOWS
      WHERE
        follower_id = (
          SELECT id FROM users WHERE username = ?
        )
      AND
        followee_id = ?
    `;
    result = await executeQuery({
      query,
      values: [username, followId],
    });
  }

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while executing query!" });
    return;
  }

  res
    .status(200)
    .json({ message: `Follow ${followStatus ? "created" : "deleted"}!` });
}
