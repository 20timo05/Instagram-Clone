import requireAuth from "../../pages/api/auth/requireAuth";
import executeQuery from "../../database/executeQuery";

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

export default async function handler(
  req,
  res,
  data,
  chatRoomsOnlineUsers,
  setChatRoomsOnlineUsers
) {
  const { isJoining } = data;
  const username = await requireAuth(req, res);
  if (isJoining) {
    // check if user is allowed to join the room
    const userChats = await getUserChats(username);
    for (let chat of userChats) {
      const chatRoomAlreadyExists = chatRoomsOnlineUsers.find(
        ({ id }) => id === chat.id
      );
      // create a new room with only this user online
      if (chatRoomAlreadyExists) {
        if (!chatRoomAlreadyExists.members.includes(username)) {
          chatRoomAlreadyExists.members.push(username);
        }
      } else {
        chatRoomsOnlineUsers.push({ id: chat.id, members: [username] });
      }
    }
  } else {
    // remove user from all chats
    for (let i = 0; i < chatRoomsOnlineUsers.length; i++) {
      const { members } = chatRoomsOnlineUsers[i];
      if (members.includes(username)) {
        if (members.length > 1) {
          members.splice(members.indexOf(username), 1);
        } else {
          chatRoomsOnlineUsers.splice(i, 1)
          i--
        }
      }
    }
  }
  // save the changes
  setChatRoomsOnlineUsers(chatRoomsOnlineUsers);

  res.json({ message: "completed" });
}
