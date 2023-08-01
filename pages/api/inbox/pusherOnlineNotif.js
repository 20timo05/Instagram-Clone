import requireAuth from "../auth/requireAuth";

import { getData as getChats } from "./getChats";
import { sendMessage } from "./pusher";
import { getData as getUser } from "../user/getUser";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "This method requires POST!" });

  const { isOnline, receiver } = req.body;

  // get username and then userId
  const username = await requireAuth(req, res);
  const [userDataError, userData] = await getUser(username);
  if (userDataError) return res.status(userData.code).json(userData.err);
  // console.log(`${username} is now ${isOnline ? "online" : "offline"}`);

  // get all chats
  const [chatsError, chatsData] = await getChats(userData.id);
  if (chatsError) return res.status(chatsData.code).json(chatsData.err);
  if (receiver) {
    if (receiver === username) {
      return res
        .status(200)
        .json({ msg: "Receiver can not be current logged in user!" });
    }

    // send out notification only to chat with specified receiver
    const chatId = chatsData.find(({ group_members }) =>
      group_members.includes(receiver)
    )?.id;
    if (!chatId) {
      return res
        .status(500)
        .json({ err: "An Error occurred while retrieving chatId!" });
    }
    await sendMessage(username, chatId, "online-notif", { isOnline, receiver });
  } else {
    // send out notifications to all chatIds
    const chatIds = chatsData.map(({ id }) => id);
    for (let chatId of chatIds) {
      await sendMessage(username, chatId, "online-notif", {
        isOnline,
        receiver,
      });
    }
  }

  res.json({ message: "completed" });
}
