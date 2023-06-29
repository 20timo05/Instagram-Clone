import getReqData from "../../../lib/getReqData";
import saveFile from "../../../lib/saveFile";

import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "This method requires POST!" });

  const username = await requireAuth(req, res);
  if (!username) return;

  const formData = await getReqData(req);
  const data = JSON.parse(formData.fields.data);
  const files = formData.files;

  // creates post and returns the assigned id
  const postId = await insertPost(
    username,
    data.caption,
    data.allowLikes,
    data.allowComments
  );

  // extract hashtags from caption
  const hashtags = data.caption.match(/#[a-z]+/gi);
  if (hashtags) {
    await insertHashtags(
      postId,
      hashtags.map((hashtag) => hashtag.replace("#", ""))
    );
  }

  if (data.location.name) await insertLocation(postId, data.location);

  // save photos
  for (let i = 0; i < data.imgData.length; i++) {
    const id = data.imgData[i].id;
    try {
      await saveFile(files[id], "post_photos", username, `${postId}_${id}.jpg`);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ err: "An Error occurred while saving the file!" });
    }
  }
  await insertPhotos(postId, data.imgData);

  res.status(200).json({ message: "Photos created!" });
}

async function insertPost(
  currentLoggedInUser,
  caption,
  allowLikes,
  allowComments
) {
  const createPostQuery = `
  INSERT INTO POSTS (
      user_id,
      caption,
      allowLikes,
      allowComments
      )
      VALUES ((
        SELECT id FROM users
        WHERE username = ?
        ), ?, ?, ?);
        `;

  const result1 = await executeQuery({
    query: createPostQuery,
    values: [
      currentLoggedInUser,
      caption,
      allowLikes ? 1 : 0,
      allowComments ? 1 : 0,
    ],
  });

  if (result1.error) console.log(result1.error);

  const getPostIdQuery = `
    SELECT
      posts.id
    FROM posts
    INNER JOIN users
      ON posts.user_id = users.id
    WHERE username = ? AND caption = ?
    ORDER BY posts.created_at DESC
    LIMIT 1 
  `;

  const result2 = await executeQuery({
    query: getPostIdQuery,
    values: [currentLoggedInUser, caption],
  });

  if (result2.error) return console.log(result2.error);

  return result2[0].id;
}

async function insertHashtags(postId, hashtags) {
  // insert into tags table if it does not exist already
  let hashTagQuery = `
      INSERT IGNORE INTO tags(tag_name)
      VALUES 
    `;

  for (let i = 0; i < hashtags.length; i++) {
    hashTagQuery += "(?), ";
  }
  hashTagQuery = hashTagQuery.slice(0, -2) + ";";

  const result1 = await executeQuery({
    query: hashTagQuery,
    values: [...hashtags],
  });

  if (result1.error) console.log(result1.error);

  // add connection to post (post_tags table)
  let hashTagConnectionsQuery = `
    INSERT INTO post_tags (post_id, tag_id)
    SELECT ?, t.id
    FROM (
      SELECT id
      FROM tags
      WHERE tag_name IN (${hashtags.map(() => "?").join(", ")})
    ) t;
  `;

  const result2 = await executeQuery({
    query: hashTagConnectionsQuery,
    values: [postId, ...hashtags],
  });

  if (result2.error) console.log(result2.error);
}

async function insertLocation(postId, locationObj) {
  const locationQuery = `
    INSERT IGNORE INTO locations(name, lat, lng)
    VALUES (?, ?, ?);
  `;
  const result1 = await executeQuery({
    query: locationQuery,
    values: [locationObj.name, locationObj.pos.lat, locationObj.pos.lng],
  });

  if (result1.error) console.log(result1.error);

  const locationConnectionsQuery = `
    INSERT IGNORE INTO post_locations(location_id, post_id)
    VALUES (
      (
        SELECT 
          id
        FROM locations
        WHERE
          name = ? AND
          lat = ? AND
          lng = ?
      ),
      ?
    );
  `;
  const result2 = await executeQuery({
    query: locationConnectionsQuery,
    values: [
      locationObj.name,
      locationObj.pos.lat,
      locationObj.pos.lng,
      postId,
    ],
  });

  if (result2.error) console.log(result2.error);
}

async function insertPhotos(postId, imgData) {
  let insertPhotosQuery = `
    INSERT INTO photos (post_id, position, alternativeText)
    VALUES 
  `;
  let insertPeopleTagsQuery = `
    INSERT INTO people_tags (photo_id, tag_name_id, posX, posY)
    VALUES 
  `;
  for (let i = 0; i < imgData.length; i++) {
    insertPhotosQuery += "(?, ?, ?), ";
    for (let j = 0; j < imgData[i].peopleTags.length; j++) {
      insertPeopleTagsQuery += `((
        SELECT id FROM photos
        WHERE post_id = ? AND position = ?
      ), ?, ?, ?), `;
    }
  }
  insertPhotosQuery = insertPhotosQuery.slice(0, -2) + ";";
  insertPeopleTagsQuery = insertPeopleTagsQuery.slice(0, -2) + ";";

  const photosParametersArray = imgData
    .map((img) => [postId, img.id, img.alternativeText])
    .flat(1);
  const photosResult = await executeQuery({
    query: insertPhotosQuery,
    values: photosParametersArray,
  });

  if (photosResult.error) console.log(photosResult.error);

  // add people tags for every photo
  const peopleTagsParametersArray = imgData
    .map((img) =>
      img.peopleTags.map((peopleTag) => [
        postId,
        img.id,
        peopleTag.userId,
        peopleTag.x,
        peopleTag.y,
      ])
    )
    .flat(2);

  if (peopleTagsParametersArray.length > 0) {
    const peopleTagsResult = await executeQuery({
      query: insertPeopleTagsQuery,
      values: peopleTagsParametersArray,
    });

    if (peopleTagsResult.error) console.log(peopleTagsResult.error);
  }
}
