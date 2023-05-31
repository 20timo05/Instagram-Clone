import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export default async function handler(req, res) {
  if (req.method !== "DELETE")
    return res.status(405).json({ error: "This method requires DELETE!" });

  const username = await requireAuth(req, res);
  if (!username) return;

  const { isResponse, id } = req.body;

  let deletePostQuery;
  if (!isResponse) {
    deletePostQuery = `
      DELETE FROM comments
      WHERE
        id = ? AND
        user_id = (
          SELECT id FROM users
          WHERE username=?
        )
    `;
  } else {
    deletePostQuery = `
      DELETE FROM comments_responses
      WHERE
        id = ? AND
        user_id = (
          SELECT id FROM users
          WHERE username=?
        )
    `;
  }

  const result = await executeQuery({
    query: deletePostQuery,
    values: [id, username],
  });

  if (result.error) {
    res.status(500).json({ err: "An Error occurred while creating post!" });
    console.log(result.error);
    return;
  }

  res.status(200).json({ message: "Comment deleted!" });
}
