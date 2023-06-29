import path from "path";
import fs from "fs/promises";

export default async function saveFile(file, dirName, username, filename) {
  // check if there is a directory for the user already
  // (if the user has not posted anything yet, no folder is created)
  const userDirectory = path.join(
    process.cwd(),
    `/assets/${dirName}/${username}`
  );
  try {
    await fs.readdir(userDirectory);
  } catch (err) {
    console.log(err);
    await fs.mkdir(userDirectory);
  }

  fs.rename(file.filepath, path.join(userDirectory, filename), (err) => {
    if (err) throw err;
  });
}
