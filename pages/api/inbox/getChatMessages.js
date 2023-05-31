import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export async function getData(chatId, username) {
  const authQuery = `
    SELECT
      *
    FROM chat_group_members
    INNER JOIN users
      ON chat_group_members.user_id = users.id
    WHERE
      group_id = ? AND username = ?;
  `;
  const authResult = await executeQuery({
    query: authQuery,
    values: [chatId, username],
  });

  if (authResult.error) {
    console.log(authResult.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query" },
    ];
  }

  if (authResult.length === 0) {
    return [true, { code: 401, err: "You are not authorized for this chat" }];
  }

  const query = `
    SELECT
      chat_messages.id,
      username,
      message_type,
      value,
      chat_messages.created_at
    FROM chat_messages
    INNER JOIN users
      ON chat_messages.sender_user_id = users.id
    WHERE group_id = ?
    ORDER BY chat_messages.created_at
    ;
  `;

  const result = await executeQuery({
    query,
    values: [chatId],
  });

  if (result.error) {
    console.log(result.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query" },
    ];
  }

  // get chat message like data
  const likeQuery = `
    SELECT
      id,
      username,
      message_id
    FROM chat_messages_likes
    INNER JOIN users
      ON chat_messages_likes.user_id = users.id
    WHERE message_id IN (?);
  `;
  const likeResult = await executeQuery({
    query: likeQuery,
    values: [result.map(({ id }) => id)],
  });

  if (likeResult.error) {
    console.log(likeResult.error);
    return [
      true,
      { code: 500, err: "An Error occurred while executing query" },
    ];
  }
  for (let i = 0; i < likeResult.length; i++) {
    const resultIdx = result.findIndex(
      (message) => message.id === likeResult[i].message_id
    );
    result[resultIdx].likes = (result[resultIdx].likes || []).concat(
      likeResult[i]
    );
  }

  return [false, JSON.parse(JSON.stringify(result))];
}

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "This method requires GET!" });

  const username = await requireAuth(req, res);
  if (!username) return;

  const { chatId } = req.query;
  const [error, data] = await getData(chatId, username);

  if (error) return res.status(data.code).json({ error: data.err });
  res.status(200).json(data);
}
