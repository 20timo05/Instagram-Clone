import executeQuery from "../../../database/executeQuery";

export async function getData(userId, lazyLoadIteration = 0) {
  // get all posts associated with the follows of this user
  const postsQuery = `
    SELECT
      users.id AS user_id,
      users.username,
      posts.id AS post_id,
      posts.caption,
      posts.created_at,
      (CASE WHEN posts.allowLikes = 1 THEN TRUE ELSE FALSE END) AS allowLikes,
      (CASE WHEN posts.allowComments = 1 THEN TRUE ELSE FALSE END) AS allowComments,
      COUNT(DISTINCT likes.user_id) AS "likeCount",
      COUNT(DISTINCT comments.id) AS "commentCount",
      CASE WHEN saved_posts.user_id IS NULL THEN FALSE ELSE TRUE END AS isSaved
    FROM posts
    INNER JOIN users
      ON posts.user_id = users.id
    INNER JOIN likes
      ON likes.post_id = posts.id
    INNER JOIN comments
      on comments.post_id = posts.id
    LEFT JOIN saved_posts
      ON
        saved_posts.post_id = posts.id
      AND
        saved_posts.user_id = ?
    WHERE posts.user_id IN (
      SELECT id FROM users
      INNER JOIN follows
        ON follows.followee_id = users.id
      WHERE follows.follower_id = ?
    )
    GROUP BY posts.id
    ORDER BY created_at DESC
    LIMIT 10
    OFFSET ?;
  `;

  const postsResult = await executeQuery({
    query: postsQuery,
    values: [userId, userId, parseInt(lazyLoadIteration) * 10],
  });

  if (postsResult.error) {
    console.log(postsResult.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query" },
    ];
  }

  let postsData = Object.values(JSON.parse(JSON.stringify(postsResult)));
  for (let i = 0; i < postsData.length; i++) {
    // get all photos associated with all the posts
    const postId = postsData[i].post_id;
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

  // per lazyloadIteration: reload another 10 posts
  const { userId, lazyLoadIteration } = req.query;
  const [error, data] = await getData(userId, lazyLoadIteration);

  if (error) return res.status(data.code).json({ err: data.err });
  res.status(200).json(data);
}
