import formidable from "formidable";
import path from "path";
import fs from "fs/promises";
import requireAuth from "../auth/requireAuth";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "DELETE")
    return res
      .status(405)
      .json({ error: "This method requires POST or DELETE!" });

  const username = await requireAuth(req, res);
  if (!username) return;

  const imgPath = path.join(
    process.cwd(),
    `/assets/profile_images/${username}.jpg`
  );

  if (req.method === "POST") {
    const formData = await readFile(req, true);
    const { profilePicture } = formData.files;

    // read the contents of the file
    const fileContent = await fs.readFile(profilePicture.filepath);

    // save profilePicture
    await fs.writeFile(imgPath, fileContent);

    res.status(200).json({ message: "Profile Picture created!" });
  } else {
    await fs.unlink(imgPath);
    res.status(200).json({ message: "Profile Picture deleted!" });
  }
}

function readFile(req) {
  const form = formidable();
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
}
