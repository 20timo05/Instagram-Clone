import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "This method requires POST!" });

  const username = await requireAuth(req, res);
  if (!username) return;

  const { messageId, likeStatus } = req.body;

  let result;
  if (likeStatus) {
    // create chat like
    const query = `
    INSERT INTO chat_messages_likes(user_id, message_id)
    VALUES (
      (SELECT id FROM users WHERE username = ?),
      ?
    );
    `;
    result = await executeQuery({
      query,
      values: [username, messageId],
    });
  } else {
    const query = `
      DELETE FROM chat_messages_likes
      WHERE
        user_id = (
          SELECT id FROM users WHERE username = ?
        )
      AND
        message_id = ?
    `;
    result = await executeQuery({
      query,
      values: [username, messageId],
    });
  }

  if (result.error) {
    console.log(result.error);
    res.status(500).json({ err: "An Error occurred while executing query!" });
    return;
  }

  res
    .status(200)
    .json({ message: `Like ${likeStatus ? "created" : "deleted"}!` });
}
