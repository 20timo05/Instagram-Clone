import executeQuery from "../../../database/executeQuery";

export async function getData(userId) {
  const query = `
    SELECT
      users.id,
      users.username
    FROM follows
    INNER JOIN users
      ON users.id = follows.followee_id
    WHERE follows.follower_id = ?
    ;
  `;

  const result = await executeQuery({ query, values: [userId] });

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

  if (error) return res.status(data.code).json({ error: data.err });
  res.status(200).json(data);
}
