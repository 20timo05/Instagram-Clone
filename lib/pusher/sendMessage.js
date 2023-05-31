import requireAuth from "../../pages/api/auth/requireAuth";
import { pusher, chatRoomsOnlineUsers } from "./joinRoom";

// @TODO
// chatRoomsOnlineUsers is working correctly but can't be accessed from this file
// => it has entries in joinRoom, but here it is just []
// combine joinRoom.js and sendMessage.js API Routes into 1
// => with type in body, still code splitting, just execute this handler from the main api route and give chatRoomsOnlineUsers as a parameter

export default async function handler(req, res) {
  const { message, message_type = "text", chatId, created_at } = req.body;
  const username = await requireAuth(req, res);

  console.log("online chats: ", chatRoomsOnlineUsers)
  console.log("chat id: ", chatId)

  const chatRoomOnlineMembers = chatRoomsOnlineUsers.find(
    (room) => room.id === chatId
  ).members;

  const response = await pusher.trigger(chatRoomOnlineMembers, "chat-event", {
    message,
    message_type,
    sender: username,
    chatId,
    created_at,
  });

  res.json({ message: "completed" });
}
