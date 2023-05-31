import Pusher from "pusher";

import requireAuth from "../../auth/requireAuth";
import executeQuery from "../../../../database/executeQuery";

export let chatRoomsOnlineUsers = [];

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

async function checkUserAllowed(username, chatId) {
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
  const { chatId, isJoining } = req.body;

  const username = await requireAuth(req, res);
  const chatRoom = chatRoomsOnlineUsers.find((room) => room.id === chatId);
  if (isJoining) {
    // check if user is allowed to join the room
    const userAllowed = await checkUserAllowed(username, chatId);
    if (!userAllowed) {
      return res
        .status(401)
        .json({ error: "You are not a member of this chat!" });
    }
    if (chatRoom) {
      chatRoom.members.push(username);
    } else {
      chatRoomsOnlineUsers.push({ id: chatId, members: [username] });
    }
  } else if (chatRoom) {
    chatRoom.members.splice(chatRoom.members.indexOf(username), 1);
    if (chatRoom.members.length === 0) {
      chatRoomsOnlineUsers.splice(chatRoomsOnlineUsers.indexOf(chatRoom), 1);
    }
  }

  console.log(chatRoomsOnlineUsers);

  res.json({ message: "completed" });
}
