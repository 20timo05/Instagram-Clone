import executeQuery from "../../../../database/executeQuery";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });

  const { userId } = req.query;
  const query = `
    SELECT
      users.id,
      username,
      full_name
    FROM last_searches
    INNER JOIN users
      ON last_searches.searched_user_id = users.id
    WHERE last_searches.user_id = ?
    ORDER BY last_searches.created_at DESC;
    ;
  `;

  const result = await executeQuery({ query, values: [userId] });

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while executing query" });
    return;
  }

  res.status(200).json(result);
}
