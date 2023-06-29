import fs from "fs/promises";
import path from "path";

import requireAuth from "../auth/requireAuth";
import executeQuery from "../../../database/executeQuery"

export default async function imageHandler(req, res) {
  const { filename, username } = req.query;

  const currentLoggedInUsername = await requireAuth(req, res);
  if (!currentLoggedInUsername) return;

  const [userAllowedToSeeMsgError, error] = await checkUserAllowedToSeeMsg(
    filename,
    currentLoggedInUsername
  );
  if (userAllowedToSeeMsgError)
    return res.status(error.code).json({ err: error.err });

  try {
    const filePath = path.join(
      process.cwd(),
      "assets",
      "chat_message_files",
      username,
      filename
    );
    const fileContent = await fs.readFile(filePath);
    res.status(200).send(fileContent);
  } catch (err) {
    res.status(404).json({ msg: "File not found!" });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
};

async function checkUserAllowedToSeeMsg(filename, currentLoggedInUsername) {
  const id = filename.substring(0, filename.indexOf("."));

  const query = `
    SELECT
      *
    FROM chat_group_members
    WHERE
      user_id = (SELECT id FROM users WHERE username = ?)
    AND
      group_id = (SELECT group_id FROM chat_messages WHERE id = ?);
  `;

  const result = await executeQuery({
    query,
    values: [currentLoggedInUsername, id],
  });

  if (result.error) {
    console.log(result.error);
    return [
      true,
      { code: 500, err: "An Error occurred while checking for permission!" },
    ];
  }

  if (result.length === 0) {
    return [
      true,
      { code: 401, err: "You are not authorized to see this message!" },
    ];
  }

  return [false];
}
