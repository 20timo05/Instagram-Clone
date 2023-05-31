import { useEffect, useState } from "react";
import Pusher from "pusher-js";

import { fetchData } from "./useFetch";

export default function Chat(chatsData, chatId, sender, isTyping) {
  const [chats, setChats] = useState(chatsData);

  const [otherChatUserTyping, setOtherChatUserTyping] = useState([]);
  const typingUser = otherChatUserTyping
    .filter((user) => user.chatId === chatId && user.username !== sender)
    .slice(-1)[0]?.username;

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: "eu",
      channelAuthorization: { endpoint: "/api/inbox/pusherAuth" },
    });

    const channel = pusher.subscribe(`private-${chatId}`);

    channel.bind("incoming-message", (data) => incomingMessage(data, setChats));

    channel.bind("typing-notification", (data) => {
      const { sender, chatId, isTyping } = data;
      if (!isTyping) {
        return setOtherChatUserTyping((prev) =>
          prev.filter(({ username }) => username !== sender)
        );
      }

      setOtherChatUserTyping((prev) => [
        ...prev.filter(({ username }) => username !== sender),
        { username: sender, chatId },
      ]);
    });

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

    // sending message stops typing
    await sendTypingNotification(false);

    // send message in realtime to other online users
    await fetchData("POST", "/api/inbox/pusher", {
      type: "incoming-message",
      message: value,
      message_type: "text",
      chatId,
      created_at: new Date().toISOString(),
    });
  };

  // send notification to other users if current logged in user starts typing
  async function sendTypingNotification(isTyping) {
    await fetchData("POST", "/api/inbox/pusher", {
      type: "typing-notification",
      chatId,
      isTyping,
    });
  }
  useEffect(() => {
    if (isTyping !== null) sendTypingNotification(isTyping);
  }, [isTyping]);

  return [chats, sendMessage, typingUser];
}

function incomingMessage(data, setChats) {
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
}
