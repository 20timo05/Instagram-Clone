import requireAuth from "../auth/requireAuth";

import { pusher, checkUserChat } from "./pusherAuth";

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

  const response = await pusher.trigger(`private-${data.chatId}`, type, {
    ...data,
    sender: username,
  });

  res.json({ message: "completed" });
}
