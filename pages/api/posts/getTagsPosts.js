import executeQuery from "../../../database/executeQuery";

export async function getData(tagname, lazyLoadIteration = 0) {
  // get all posts associated with this user
  const postsQuery = `
    SELECT
      posts.id,
      users.username,
      (CASE WHEN posts.allowLikes = 1 THEN TRUE ELSE FALSE END) AS allowLikes,
      (CASE WHEN posts.allowComments = 1 THEN TRUE ELSE FALSE END) AS allowComments,
      COUNT(DISTINCT likes.user_id) AS "likeCount",
      COUNT(DISTINCT comments.id) AS "commentCount"
    FROM tags
    INNER JOIN post_tags
      ON post_tags.tag_id = tags.id
    INNER JOIN posts
      ON post_tags.post_id = posts.id
    LEFT JOIN likes
      ON likes.post_id = posts.id
    LEFT JOIN comments
      ON comments.post_id = posts.id
    INNER JOIN users
      ON users.id = posts.user_id
    WHERE
      tags.tag_name = ?
    GROUP BY posts.id
    ORDER BY likeCount DESC, commentCount DESC
    LIMIT 10
    OFFSET ?;
  `;

  const postsResult = await executeQuery({
    query: postsQuery,
    values: [tagname, lazyLoadIteration * 10],
  });

  if (postsResult.error) {
    console.log(postsResult.error);
    return [
      true,
      {
        code: 500,
        err: "An Error occurred while executing query  (retrieving posts)",
      },
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
        {
          code: 500,
          err: "An Error occurred while executing query (retrieving photos)",
        },
      ];
    }

    // add photos to post data Object
    postsData[i].photos = Object.values(
      JSON.parse(JSON.stringify(photosResult))
    );
  }

  // find out how many posts actually have the hashtag (without LIMIT 10)
  const countQuery = `
    SELECT
      COUNT(*) AS "count"
    FROM tags
    INNER JOIN post_tags
      ON post_tags.tag_id = tags.id
    INNER JOIN posts
      ON post_tags.post_id = posts.id
    WHERE
      tags.tag_name = ?
    `;
  const countResult = await executeQuery({
    query: countQuery,
    values: [tagname],
  });

  if (countResult.error) {
    console.log(countResult.error);
    return [
      true,
      {
        code: 500,
        err: "An Error occurred while executing query (counting posts)",
      },
    ];
  }

  return [false, { postsData, postsCount: countResult[0].count }];
}

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });

  const { tagname, lazyLoadIteration } = req.query;
  const [error, data] = await getData(tagname, lazyLoadIteration);

  if (error) return res.status(data.code).json({ err: data.err });
  res.status(200).json(data);
}
