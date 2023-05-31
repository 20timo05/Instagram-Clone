import executeQuery from "../../../database/executeQuery";

export async function getData(photos) {
  let query = `
    SELECT
      photo_id,
      users.username,
      posX,
      posY
    FROM people_tags
    INNER JOIN users
      ON people_tags.tag_name_id = users.id
    WHERE people_tags.photo_id IN (
  `;
  for (let i = 0; i < photos.length; i++) {
    query += `?, `;
  }
  query = query.slice(0, -2) + ");";

  const result = await executeQuery({ query, values: [...photos] });

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
    return res.status(405).json({ err: "This method requires GET!" });

  const { photos } = req.query;
  const parsedPhotos = JSON.parse(photos);
  const [error, data] = await getData(parsedPhotos);

  if (error) return res.status(data.code).json({ err: data.err });
  res.status(200).json(data);
}
