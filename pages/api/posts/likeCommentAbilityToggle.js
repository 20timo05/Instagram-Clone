import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export default async function handler(req, res) {
  if (req.method !== "PATCH")
    return res.status(405).json({ error: "This method requires PATCH!" });

  const username = await requireAuth(req, res);
  if (!username) return;

  const { postId, allowLikes, allowComments } = req.body;
  console.log(allowLikes, allowComments);
  // create
  const likeCommentAbilityQuery = `
    UPDATE posts
    SET allowLikes = ?, allowComments = ?
    WHERE id = ? AND user_id = (
      SELECT
        id
      FROM users
      WHERE username = ?
    );
  `;

  const result = await executeQuery({
    query: likeCommentAbilityQuery,
    values: [allowLikes ? 1 : 0, allowComments ? 1 : 0, postId, username],
  });

  console.log(result.error);

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while updating like!" });
    return;
  }

  res
    .status(200)
    .json({ message: `Like or Comment Ability changed successfully!` });
}
