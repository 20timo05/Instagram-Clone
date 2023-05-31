import executeQuery from "../../../database/executeQuery";

export async function getData(userId) {
  // selects the top 10 users with the most followers
  // => excluding the users that the currentLoggedInUser already follows
  // => excluding the currentLoggedInUser himself if he was on that list
  const query = `
    SELECT
      users.id,
      users.username,
      COUNT(*) AS followers
    FROM follows
    INNER JOIN users
      ON users.id = follows.followee_id
    WHERE
      ?
      NOT IN
      (SELECT follower_id FROM follows WHERE followee_id = users.id)
    AND
      users.id != ?
    GROUP BY follows.followee_id
    ORDER BY followers DESC
    LIMIT 10;
  `;

  const result = await executeQuery({ query, values: [userId, userId] });

  if (result.error) {
    console.log(result.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query" },
    ];
  }

  return [false, JSON.parse(JSON.stringify(result))];
}

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });

  const { userId } = req.query;
  const [error, data] = await getData(userId);

  if (error) return res.status(data.code).json({ err: data.err });
  res.status(200).json(data);
}
