import executeQuery from "../../../database/executeQuery";

const fs = require("fs");
const https = require("https");
const path = require("path");

async function saveImage(imageUrl, subPath, filename) {
  const dirName = path.join(process.cwd(), "/public/post_photos", subPath);

  if (!fs.existsSync(dirName)) {
    try {
      fs.mkdirSync(dirName, { recursive: true });
    } catch (error) {
      console.error(error);
    }
  }

  return new Promise((resolve, reject) => {
    // Determine the file extension from the image URL
    const fileURL = path.join(dirName, filename);
    const fileExtension = imageUrl.split(".").pop();
    const file = fs.createWriteStream(`${fileURL}.${fileExtension}`);
    https
      .get(imageUrl, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (error) => {
        fs.unlink(fileName);
        reject(error);
      });
  });
}

export default async function handler(req, res) {
  // count photos
  const getPhotosQuery = `
    SELECT
      username,
      post_id,
      position,
      image_url
    FROM photos
    INNER JOIN posts
      ON photos.post_id = posts.id
    INNER JOIN users
      ON posts.user_id = users.id
  `;
  const getPhotosResult = await executeQuery({ query: getPhotosQuery });

  for (let i = 0; i < getPhotosResult.length; i++) {
    const { image_url, username, post_id, position } = getPhotosResult[i];
    await saveImage(image_url, username, `${post_id}_${position}`);
    console.log(`Photo ${i + 1}/${getPhotosResult.length}`);
  }

  res.status(200).json({ done: "ok" });
}
