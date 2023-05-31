import Pusher from "pusher";

import joinRoom from "../../../lib/pusher/joinRoom";
import sendMessage from "../../../lib/pusher/sendMessage"

export let chatRoomsOnlineUsers = [];
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

export default async function handler(req, res) {
  const { type, ...data} = req.body;

  if (type === "join") await joinRoom(req, res, chatRoomsOnlineUsers, data)

}