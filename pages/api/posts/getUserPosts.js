import executeQuery from "../../../database/executeQuery";

export async function getData(userId, lazyLoadIteration = 0) {
  // get all posts associated with this user
  const postsQuery = `
    SELECT
      posts.id,
      posts.caption,
      posts.created_at,
      (CASE WHEN posts.allowLikes = 1 THEN TRUE ELSE FALSE END) AS allowLikes,
      (CASE WHEN posts.allowComments = 1 THEN TRUE ELSE FALSE END) AS allowComments,
      COUNT(DISTINCT likes.user_id) AS "likeCount",
      COUNT(DISTINCT comments.id) AS "commentCount",
      locations.name AS "location",
      locations.lat,
      locations.lng
    FROM posts
    LEFT JOIN likes
      ON likes.post_id = posts.id
    LEFT JOIN comments
      ON comments.post_id = posts.id
    LEFT JOIN post_locations
      ON post_locations.post_id = posts.id
    LEFT JOIN locations
      ON locations.id = post_locations.location_id
    WHERE
      posts.user_id = ?
    GROUP BY posts.id
    ORDER BY created_at DESC
    LIMIT ?
    OFFSET ?;
    `;

  const postsResult = await executeQuery({
    query: postsQuery,
    values: [userId, lazyLoadIteration * 10 + 10, lazyLoadIteration * 10],
  });

  if (postsResult.error) {
    console.log(postsResult.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query" },
    ];
  }

  let postsData = Object.values(JSON.parse(JSON.stringify(postsResult)));
  // get all photos associated with all the posts
  for (let i = 0; i < postsData.length; i++) {
    const postId = postsData[i].id;
    const photosQuery = `
      SELECT
        photos.id,
        CONCAT("/api/getFiles/getPostPhoto/", username, "/", post_id, "_", position, ".jpg") AS image_url,
        username,
        post_id,
        position,
        alternativeText
      FROM photos
      INNER JOIN posts
        ON photos.post_id = posts.id
      INNER JOIN users
        ON posts.user_id = users.id
      WHERE post_id = ?
    `;

    const photosResult = await executeQuery({
      query: photosQuery,
      values: [postId],
    });

    if (photosResult.error) {
      console.log(photosResult.error);
      return [
        true,
        { code: 500, err: "An Error occurred while executing query" },
      ];
    }

    // add photos to post data Object
    postsData[i].photos = Object.values(
      JSON.parse(JSON.stringify(photosResult))
    );
  }

  return [false, postsData];
}

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });

  const { userId, lazyLoadIteration } = req.query;
  const [error, postsData] = await getData(userId, lazyLoadIteration);

  if (error) res.status(postsData.code).json({ err: postsData.err });
  res.status(200).json(postsData);
}
