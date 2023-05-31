import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export default async function handler(req, res) {
  if (req.method !== "DELETE" && req.method !== "POST")
    return res
      .status(405)
      .json({ error: "This method requires POST or DELETE!" });

  const username = await requireAuth(req, res);
  if (!username) return;
  
  console.log(req.body);
  const { searched_user_id } = req.body;
  console.log(username, searched_user_id);

  let query;
  if (req.method === "DELETE") {
    query = `
      DELETE FROM last_searches
      WHERE
        user_id = (
          SELECT
            id
          FROM users
          WHERE username = ?
        ) AND searched_user_id = ?;
    `;
  } else {
    query = `
      INSERT INTO last_searches (user_id, searched_user_id)
      VALUES (
        (
          SELECT
            id
          FROM users
          WHERE username = ?
        ),
        ?
      )
      ON DUPLICATE KEY
          UPDATE created_at = NOW();
    `;
  }

  const result = await executeQuery({
    query,
    values: [username, searched_user_id],
  });

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while executing query!" });
    return;
  }

  res.status(200).json({
    message: `Last Search ${req.method === "POST" ? "added" : "deleted"}!`,
  });
}
