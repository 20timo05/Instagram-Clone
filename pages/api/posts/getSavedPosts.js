import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });

  const { lazyLoadIteration = 0 } = req.query;

  const username = await requireAuth(req, res);
  if (!username) return;

  // get all posts associated with this user
  const postsQuery = `
    SELECT
      posts.id,
      postCreaterUser.username,
      (CASE WHEN posts.allowLikes = 1 THEN TRUE ELSE FALSE END) AS allowLikes,
      (CASE WHEN posts.allowComments = 1 THEN TRUE ELSE FALSE END) AS allowComments,
      COUNT(DISTINCT likes.user_id) AS "likeCount",
      COUNT(DISTINCT comments.id) AS "commentCount"
    FROM saved_posts
    LEFT JOIN posts
      ON posts.id = saved_posts.post_id
    LEFT JOIN likes
      ON likes.post_id = posts.id
    LEFT JOIN comments
      ON comments.post_id = posts.id
    LEFT JOIN users currentLoggedInUser
      ON currentLoggedInUser.id = saved_posts.user_id
    LEFT JOIN users postCreaterUser
      ON postCreaterUser.id = posts.user_id
    WHERE
      currentLoggedInUser.username = ?
    GROUP BY posts.id
    ORDER BY posts.created_at DESC
    LIMIT 10
    OFFSET ?;
  `;
  
  const postsResult = await executeQuery({
    query: postsQuery,
    values: [username, lazyLoadIteration * 10],
  });

  if (postsResult.error) {
    console.log(postsResult.error);
    res.status(500).json({ err: "An Error occurred while executing query" });
    return;
  }

  let postsData = Object.values(JSON.parse(JSON.stringify(postsResult)));
  // get all photos associated with all the posts
  for (let i = 0; i < postsData.length; i++) {
    const postId = postsData[i].id;
    const photosQuery = `
      SELECT
        photos.id,
        CONCAT("/api/image/post_photos/", username, "/", post_id, "_", position, ".jpg") AS image_url,
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
      res.status(500).json({ err: "An Error occurred while executing query" });
      return;
    }

    // add photos to post data Object
    postsData[i].photos = Object.values(
      JSON.parse(JSON.stringify(photosResult))
    );
  }

  res.status(200).json(postsData);
}
