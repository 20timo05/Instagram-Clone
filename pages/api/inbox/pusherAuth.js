import Pusher from "pusher";

import executeQuery from "../../../database/executeQuery";
import requireAuth from "../auth/requireAuth";

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

export async function checkUserChat(username, chatId) {
  const query = `
    SELECT
      *
    FROM chat_group_members
    INNER JOIN users
      ON users.id = user_id
    WHERE
      username = ? AND group_id = ?;   
  `;
  const result = await executeQuery({ query, values: [username, chatId] });
  if (result.error) return console.log(result.error);

  return result.length > 0;
}

export default async function handler(req, res) {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;

  const username = await requireAuth(req, res);

  // check if user is allowed to join this chat
  const chatId = channel.substring("private-".length);
  const isMember = await checkUserChat(username, chatId);
  
  if (!isMember) {
    res.status(403).json("You are not allowed to join this channel!")
    return;
  }
  
  const authResponse = pusher.authorizeChannel(socketId, channel);
  res.send(authResponse);
}
