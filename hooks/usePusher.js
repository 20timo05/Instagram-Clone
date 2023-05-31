import { useEffect, useState } from "react";
import Pusher from "pusher-js";

import { fetchData } from "./useFetch";

export default function Chat(chatsData, chatId, sender, isTyping) {
  const [chats, setChats] = useState(chatsData);
  const [otherChatUserTyping, setOtherChatUserTyping] = useState([]);
  const typingUser = otherChatUserTyping
    .filter((user) => user.chatId === chatId)
    .slice(-1).username;

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: "eu",
    });

    const channel = pusher.subscribe(sender);

    channel.bind("chat-event", function (data) {
      const { sender, message, chatId, created_at } = data;
      setChats((prevState) => {
        const newPrev = [...prevState];
        const chatIdx = newPrev.findIndex((chat) => chat.id === chatId);
        const tempChatMsgId =
          Math.max(...newPrev[chatIdx].chatMessages.map((msg) => msg.id)) + 1;
        const msg = {
          id: tempChatMsgId,
          message_type: "text",
          username: sender,
          value: message,
          created_at: created_at,
        };
        if (
          !newPrev[chatIdx].chatMessages.find(
            (msg) =>
              msg.created_at === created_at &&
              msg.username === sender &&
              msg.value === message
          )
        ) {
          newPrev[chatIdx].chatMessages.push(msg);
        }
        return newPrev;
      });
    });

    /* channel.bind("typing-notification-event", (data) => {
      const { sender, chatId, isTyping } = data;
      if (!isTyping) return setOtherChatUserTyping((prev) => prev.slice(0, -1));
      setOtherChatUserTyping((prev) => [...prev, { username: sender, chatId }]);
    }); */

    return () => {
      pusher.unsubscribe("chat");
    };
  }, [chatsData, sender]);

  const sendMessage = async (value) => {
    // save message in database
    await fetchData("POST", "/api/inbox/setMessage", {
      chatId,
      value,
      message_type: "text",
    });

    // send message in realtime to other online users
    await fetchData("POST", "/api/inbox/pusher", {
      type: "sendMessage",
      message: value,
      message_type: "text",
      chatId,
      created_at: new Date().toISOString(),
    });
  };

 /*  useEffect(() => {
    async function sendTypingNotification() {
      await fetchData("POST", "/api/inbox/pusher", {
        type: "typing-notification-event",
        chatId,
        isTyping,
      });
    }
    if (isTyping !== null) sendTypingNotification();
  }, [isTyping]); */

  return [chats, sendMessage, typingUser];
}
