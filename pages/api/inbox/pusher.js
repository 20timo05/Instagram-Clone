import requireAuth from "../auth/requireAuth";

import { pusher, checkUserChat } from "./pusherAuth";

export async function sendMessage(username, chatId, type, data) {
  const response = await pusher.trigger(`private-${chatId}`, type, {
    ...data,
    sender: username,
    chatId
  });
}

export default async function handler(req, res) {
  const { type, ...data } = req.body;

  const username = await requireAuth(req, res);
  
  const isMember = await checkUserChat(username, data.chatId);
  if (!isMember) {
    res
      .status(403)
      .json("You are not allowed to send a message to this channel!");
    return;
  }

  await sendMessage(username, data.chatId, type, data)

  res.json({ message: "completed" });
}
