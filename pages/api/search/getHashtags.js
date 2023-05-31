import executeQuery from "../../../database/executeQuery";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });
  const { searchVal, lazyLoadIteration = 0 } = req.query;
  
  const query = `
    SELECT
      tag_name,
      COUNT(*) AS quantity
    FROM tags
    INNER JOIN post_tags
      ON tag_id = tags.id
    WHERE tag_name LIKE CONCAT("%", ?, "%")
    GROUP BY tag_name
    ORDER BY COUNT(*) DESC
    LIMIT 10
    OFFSET ?;
  `;

  const result = await executeQuery({
    query,
    values: [searchVal, parseInt(lazyLoadIteration) * 10],
  });

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while executing query" });
    return;
  }

  res.status(200).json(result);
}
