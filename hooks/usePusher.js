import { useEffect, useState } from "react";
import Pusher from "pusher-js";

import { fetchData } from "./useFetch";

export default function usePusher(
  chatsData,
  currentChatId,
  sender,
  isTyping,
  incomingMsgHandler = null
) {
  const [chats, setChats] = useState(chatsData);
  const [otherChatUserTyping, setOtherChatUserTyping] = useState([]);
  const typingUser = otherChatUserTyping
    .filter((user) => user.chatId === currentChatId && user.username !== sender)
    .slice(-1)[0]?.username;

  useEffect(() => {
    if (chatsData === null) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: "eu",
      channelAuthorization: { endpoint: "/api/inbox/pusherAuth" },
    });

    chatsData.map(({ id }) => {
      const channel = pusher.subscribe(`private-${id}`);

      channel.bind("incoming-message", (data) =>
        incomingMsgHandler
          ? incomingMsgHandler(data)
          : incomingMessage(data, setChats)
      );
      channel.bind("typing-notification", incomingTypingNotificationHandler);
    });

    return () => {
      pusher
        .allChannels()
        .forEach(({ channel }) => pusher.unsubscribe(channel));
    };
  }, [chatsData, sender]);

  async function sendMessage(value, message_type, chatId = currentChatId) {
    const formData = new FormData();
    formData.append("chatId", chatId);
    formData.append("value", value);
    formData.append("message_type", message_type);

    // save message in database
    const result = await fetch("/api/inbox/setMessage", {
      method: "POST",
      body: formData,
    });
    const { id } = await result.json();

    // sending message stops typing
    await sendTypingNotification(false, chatId);

    // send message in realtime to other online users
    await fetchData("POST", "/api/inbox/pusher", {
      type: "incoming-message",
      value: message_type === "text" ? value : id,
      filetype: message_type === "text" ? null : value.type,
      message_type,
      chatId,
      created_at: new Date().toISOString(),
    });
  }

  function incomingTypingNotificationHandler(data) {
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
  }

  // send notification to other users if current logged in user starts typing
  async function sendTypingNotification(isTyping, chatId = currentChatId) {
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
  const { sender, value, post_id, chatId, message_type, filetype, created_at } =
    data;
  setChats((prevState) => {
    const newPrev = [...prevState];
    const chatIdx = newPrev.findIndex((chat) => chat.id === chatId);
    const tempChatMsgId =
      Math.max(...newPrev[chatIdx].chatMessages.map((msg) => msg.id)) + 1;
    const msg = {
      message_type,
      username: sender,
      created_at: created_at,
    };

    if (message_type === "text") {
      msg.id = tempChatMsgId;
      msg.value = value;
    } else if (message_type === "file") {
      msg.id = value;
      msg.value = filetype;
    } else if (message_type === "post") {
      msg.id = tempChatMsgId;
      msg.post_id = post_id;
    }

    if (
      !newPrev[chatIdx].chatMessages.find(
        (msg) => msg.created_at === created_at && msg.username === sender
      )
    ) {
      newPrev[chatIdx].chatMessages.push(msg);
    }
    return newPrev;
  });
}
