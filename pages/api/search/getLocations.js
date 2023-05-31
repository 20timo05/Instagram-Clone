import executeQuery from "../../../database/executeQuery";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });
  const { searchVal, lazyLoadIteration = 0 } = req.query;
  
  const query = `
    SELECT
      locations.id,
      name,
      lat,
      lng,
      COUNT(*) AS quantity
    FROM locations
    INNER JOIN post_locations
      ON post_locations.location_id = locations.id
    WHERE name LIKE CONCAT("%", ?, "%")
    GROUP BY name
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
