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
  let { chatId, value, message_type } = formData.fields;
  if ("value" in formData.files) {
    value = formData.files.value;
  }

  const [isInChatError, errorData] = await checkUserMemberOfChat(
    chatId,
    username
  );
  if (isInChatError) return res.status(errorData.code).json(errorData.err);

  const [insertError, insertData] = await createChatMessage(
    username,
    chatId,
    message_type,
    message_type === "text" ? value : value.mimetype
  );
  if (insertError) return res.status(insertData.code).json(insertData.err);
  
  if (message_type === "file") {
    // save file with the name set to the id of the corresponding entry in the database
    const fileEnding = value.mimetype.substring(value.mimetype.indexOf("/") + 1)
    try {
      await saveFile(
        value,
        "chat_message_files",
        username,
        `${insertData}.${fileEnding}`
      );
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ err: "An Error occurred while saving the file!" });
    }
  }

  res.status(200).json({ message: `Message created!`, id: insertData });
}

async function checkUserMemberOfChat(chatId, username) {
  // check if user is member of chat
  const authQuery = `
    SELECT
      *
    FROM chat_group_members
    WHERE group_id = ? AND user_id = (
      SELECT id FROM users WHERE username = ?
    )
  `;
  const authResult = await executeQuery({
    query: authQuery,
    values: [chatId, username],
  });

  if (authResult.error) {
    console.log(authResult.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query!" },
    ];
  }
  if (authResult.length === 0) {
    return [true, { code: 401, err: "You are not authorized for this chat" }];
  }

  return [false];
}

async function createChatMessage(username, chatId, message_type, value) {
  // insert into database
  const insertQuery = `
    INSERT INTO chat_messages(sender_user_id, group_id, message_type, value)
    VALUES (
      (SELECT id FROM users WHERE username = ?),
      ?,
      ?,
      ?
    );
  `;
  const insertResult = await executeQuery({
    query: insertQuery,
    values: [username, chatId, message_type, value],
  });

  console.log(insertResult, message_type)

  if (insertResult.error) {
    console.log(insertResult.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query!" },
    ];
  }

  // retrieve id from that message (important for name of voice messages/ images/...)
  const retrieveQuery = `
    SELECT
      id
    FROM chat_messages
    WHERE
      sender_user_id = (SELECT id FROM users WHERE username = ?) AND
      group_id = ? AND
      message_type = ?
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  const retrieveResult = await executeQuery({
    query: retrieveQuery,
    values: [username, chatId, message_type, value],
  });

  if (retrieveResult.error) {
    console.log(retrieveResult.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query!" },
    ];
  }

  return [false, retrieveResult[0].id];
}
