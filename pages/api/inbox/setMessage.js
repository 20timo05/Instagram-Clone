import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "This method requires POST!" });

  const username = await requireAuth(req, res);
  if (!username) return;

  const { chatId, value, message_type } = req.body;

  // check if user is member of chat
  const authQuery = `
    SELECT
      *
    FROM chat_group_members
    WHERE group_id = ? AND user_id = (
      SELECT id FROM users WHERE username = ?
    )
  `
  const authResult = await executeQuery({
    query: authQuery,
    values: [chatId, username],
  });

  if (authResult.error) {
    console.log(authResult.error);
    res.status(500).json({ err: "An Error occurred while executing query!" });
    return;
  }
  if (authResult.length === 0) {
    return [true, { code: 401, err: "You are not authorized for this chat" }];
  }

  // create chat message
  const query = `
  INSERT INTO chat_messages(sender_user_id, group_id, message_type, value)
  VALUES (
    (SELECT id FROM users WHERE username = ?),
    ?,
    ?,
    ?
  );
  `;
  const result = await executeQuery({
    query,
    values: [username, chatId, message_type, value],
  });

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while executing query!" });
    return;
  }

  res
    .status(200)
    .json({ message: `Message created!` });
}
