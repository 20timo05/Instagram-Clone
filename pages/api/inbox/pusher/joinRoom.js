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

async function getUserChats(username) {
  const query = `
    SELECT
      group_id AS id
    FROM chat_group_members
    INNER JOIN users
      ON users.id = user_id
    WHERE
      username = ?; 
  `;
  const result = await executeQuery({ query, values: [username] });
  if (result.error) return console.log(result.error);

  return result;
}

export default async function handler(req, res) {
  const { isJoining } = req.body;

  const username = await requireAuth(req, res);
  if (isJoining) {
    // check if user is allowed to join the room
    const userChats = await getUserChats(username);
    for (let chat of userChats) {
      const chatRoomAlreadyExists = chatRoomsOnlineUsers.find(
        ({ id }) => id === chat.id
      );
      if (chatRoomAlreadyExists) {
        if (!chatRoomAlreadyExists.members.includes(username)) {
          chatRoomAlreadyExists.members.push(username);
        }
      } else {
        chatRoomsOnlineUsers.push({ id: chat.id, members: [username] });
      }
    }
  } else {
    for (let chat of chatRoomsOnlineUsers) {
      if (chat.members.includes(username)) {
        chat.members.splice(chat.members.indexOf(username), 1);
      }
    }
  }

  console.log(chatRoomsOnlineUsers);

  res.json({ message: "completed" });
}
