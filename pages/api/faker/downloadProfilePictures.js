import executeQuery from "../../../database/executeQuery";

const fs = require("fs");
const https = require("https");
const path = require("path");

async function saveImage(imageUrl, filename) {
  const fileURL = path.join(process.cwd(), "/public/profile_images", filename);
  
  // Determine the file extension from the image URL
  const fileExtension = imageUrl.split(".").pop();
  const file = fs.createWriteStream(`${fileURL}.${fileExtension}`);
  https
    .get(imageUrl, (response) => {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
      });
    })
    .on("error", (error) => {
      fs.unlink(filename);
    });
}

export default async function handler(req, res) {
  // count photos
  const getPhotosQuery = `
    SELECT
      username,
      profile_picture
    FROM users;
  `;
  const getPhotosResult = await executeQuery({ query: getPhotosQuery });

  for (let i = 0; i < getPhotosResult.length; i++) {
    const { profile_picture, username } = getPhotosResult[i];
    await saveImage(profile_picture, username);
    console.log(`Photo ${i + 1}/${getPhotosResult.length}`);
  }

  res.status(200).json({ done: "ok" });
}
