import fs from "fs/promises";
import path from "path";

import requireAuth from "../auth/requireAuth";
import executeQuery from "../../../database/executeQuery";

export default async function handler(req, res) {
  if (req.method !== "DELETE")
    return res.status(405).json({ error: "This method requires DELETE!" });

  const username = await requireAuth(req, res);
  if (!username) return;

  const { postId } = req.body;

  // delete photo information from database
  const deletePostQuery = `
    DELETE FROM posts
    WHERE
      id = ? AND
      user_id = (
        SELECT id FROM users
        WHERE username=?
      )
  `;

  const result = await executeQuery({
    query: deletePostQuery,
    values: [postId, username],
  });

  if (result.error) {
    res.status(500).json({ err: "An Error occurred while creating post!" });
    console.log(result.error);
    return;
  }

  // delete photos from assets
  const userFolderPath = path.join(
    process.cwd(),
    "/assets/post_photos",
    username
  );
  const files = await fs.readdir(userFolderPath);

  // Filter files that start with the given postId
  const filteredFiles = files.filter((filename) => filename.startsWith(postId));

  // Delete each file
  await Promise.all(
    filteredFiles.map((filename) =>
      fs.unlink(path.join(userFolderPath, filename))
    )
  );

  res.status(200).json({ message: "Post deleted!" });
}
