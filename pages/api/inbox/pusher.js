import Pusher from "pusher";

import requireAuth from "../auth/requireAuth";
import executeQuery from "../../../database/executeQuery";

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// keep track of all users who are online
const onlineUsers = [];

// when a user joins, get all of his chats and add them to the activeChatUsersGroups Array
// if the chat group object already exists (someone else is already online), add him to the members list
// when a user is online and sends a message to a specific chat, broadcast it to all online members of that chat
// => so all people in members of that chat group object
const activeChatUsersGroups = [];
console.log("from outside", onlineUsers, activeChatUsersGroups);

async function getChats(username) {
  const query = `
    SELECT
      group_id
    FROM chat_group_members
    INNER JOIN users
      ON users.id = user_id
    WHERE username = ?
  `;
  const result = await executeQuery({ query, values: [username] });
  if (result.error) return console.log(result.error);

  for (let i = 0; i < result.length; i++) {
    const { group_id } = result[i];
    const chatAlreadyExists = activeChatUsersGroups.find(
      (chatGroup) => chatGroup.group_id === group_id
    );

    if (chatAlreadyExists) {
      chatAlreadyExists.members.push(username);
    } else {
      activeChatUsersGroups.push({ group_id, members: [username] });
    }
  }
}

export default async function handler(req, res) {
  const { type, message, chatId, created_at, isTyping } = req.body;

  const username = await requireAuth(req, res);
  if (!activeChatUsersGroups.find(group => group.members.includes(username))) {
    console.log(activeChatUsersGroups)
    await getChats(username);
  }

  // get all online members of that chat
  const onlineMembers = activeChatUsersGroups.find(
    (chat) => chat.group_id === chatId
  );
  if (!onlineMembers?.includes(username)) {
    return res
      .status(401)
      .json({ error: "You are not a member of this chat!" });
  }

  if (type === "chat-event") {
    const response = await pusher.trigger(onlineMembers, "chat-event", {
      message,
      sender,
      chatId,
      created_at,
    });
  } else if (type === "typing-notification-event") {
    const response = await pusher.trigger(
      onlineMembers,
      "typing-notification-event",
      {
        sender,
        chatId,
        isTyping,
      }
    );
  }

  res.json({ message: "completed" });
}
