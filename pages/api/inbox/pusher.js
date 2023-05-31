import Pusher from "pusher";
import fs from "fs";
import path from "path";

import joinRoom from "../../../lib/pusher/joinRoom";
import sendMessage from "../../../lib/pusher/sendMessage";

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

const filePath = path.join(
  process.cwd(),
  "/lib/pusher/",
  "chatRoomsOnlineUsers.json"
);

function getChatRoomsOnlineUsers() {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function setChatRoomsOnlineUsers(newData) {
  fs.writeFileSync(filePath, JSON.stringify(newData, null, 2));
}

export default async function handler(req, res) {
  const { type, ...data } = req.body;

  const chatRoomOnlineMembers = getChatRoomsOnlineUsers();
  const params = [
    req,
    res,
    data,
    chatRoomOnlineMembers,
    setChatRoomsOnlineUsers,
  ];

  if (type === "join") await joinRoom(...params);
}
