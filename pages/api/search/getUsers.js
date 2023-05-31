import executeQuery from "../../../database/executeQuery";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });
  const { userId, searchVal, type, lazyLoadIteration = 0 } = req.query;

  // type === onlyFollowers => only get users that you follow;
  // type === mostPopular => get most popular
  // filter: if searchVal in username or full_name
  // order by how many followers this person has

  const query = `
    SELECT
      users.id,
      username,
      full_name,
      /* get number of followers*/
      (
        SELECT
          COUNT(*)
        FROM follows
        WHERE followee_id = users.id
        GROUP BY followee_id
      ) AS followers
    FROM follows
    INNER JOIN users
      ON followee_id = users.id
    WHERE
      /*
      check if type === "onlyFollowers" because if that's the case
      then result have to be filtered by condition whether the user follows them
      */
      (
        CASE
          WHEN ? = 0 THEN follower_id = ?
          ELSE 1 = 1
        END
      )
      AND
      /* check if username or full name match the searchbar value*/
      (
        username LIKE CONCAT("%", ?, "%") OR
        full_name LIKE CONCAT("%", ?, "%")
      )
    GROUP BY followee_id
    /* order by the number of followers */
    ORDER BY (
      SELECT
        COUNT(*)
      FROM follows
      WHERE followee_id = users.id
      GROUP BY followee_id
    ) DESC
    /* enable lazy loading */
    LIMIT 10
    OFFSET ?;
  `;

  const result = await executeQuery({
    query,
    values: [
      ["onlyFollowers", "mostPopular"].indexOf(type),
      userId,
      searchVal,
      searchVal,
      parseInt(lazyLoadIteration) * 10,
    ],
  });

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while executing query" });
    return;
  }

  res.status(200).json(result);
}
