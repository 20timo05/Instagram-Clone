import fs from "fs/promises";
import path from "path";

export default async function imageHandler(req, res) {
  const { username } = req.query;

  try {
    const filePath = path.join(
      process.cwd(),
      "assets",
      "profile_images",
      `${username}.jpg`
    );
    const fileContent = await fs.readFile(filePath);
    res.status(200).send(fileContent);
  } catch (err) {
    const defaultProfileFilePath = path.join(
      process.cwd(),
      "public/default_profile_image.jpg"
    );
    const defaultProfileImage = await fs.readFile(defaultProfileFilePath);
    res.status(200).send(defaultProfileImage);
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};
