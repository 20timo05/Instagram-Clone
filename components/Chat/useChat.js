import { useState, useEffect } from "react";

import usePusher from "../../hooks/usePusher";
import { fetchData } from "../../hooks/useFetch";

export default function useChat(openChatId, data, currentLoggedInUser) {
  const [chatsData, setChatsData] = useChatsData(data, openChatId);
  const [isTyping, setIsTyping] = useState(null);

  const [pusherChatsData, sendMessage, typingUser, onlineUsers] = usePusher(
    chatsData,
    openChatId,
    currentLoggedInUser.username,
    isTyping
  );
  
  const messageArrays = structureMessages(pusherChatsData, openChatId) || [];

  return {
    messageArrays,
    setChatsData,
    setIsTyping,
    sendMessage,
    typingUser,
    currentLoggedInUser,
    onlineUsers
  };
}

function useChatsData(data, openChatId) {
  const [chatsData, setChatsData] = useState(data);

  async function fetchMessages(id) {
    const { ok, data, error } = await fetchData(
      "GET",
      "/api/inbox/getChatMessages",
      { chatId: id }
    );
    if (!ok) return console.log(error);

    setChatsData((prev) => {
      const newPrev = [...prev];
      newPrev.find(({ id }) => id === openChatId).chatMessages = data;
      return newPrev;
    });
  }

  useEffect(() => {
    if (
      !openChatId ||
      chatsData.find(({ id }) => id === openChatId).chatMessages
    ) {
      return;
    }

    // fetch chat Messages
    fetchMessages(openChatId);
  }, [openChatId]);

  return [chatsData, setChatsData];
}

function structureMessages(chatsData, openChatId) {
  if (!openChatId ) return;

  // group chat messages by the day of creation
  let messageArrays = [];

  const chat = chatsData.find(({ id }) => id === openChatId);
  if (!chat?.chatMessages) return;

  const messageGroups = {};
  for (const message of chat.chatMessages) {
    const dateKey = message.created_at.substring(0, 10);
    if (!messageGroups[dateKey]) messageGroups[dateKey] = [];
    messageGroups[dateKey].push(message);
  }
  // convert the map with all message groups from all days to a 2d array
  messageArrays = Object.values(messageGroups);

  // group messages by sender
  messageArrays = messageArrays.map((messagesOfOneDay) => {
    const senderGroupMessageArray = [[messagesOfOneDay[0]]];
    for (let i = 1; i < messagesOfOneDay.length; i++) {
      if (
        messagesOfOneDay[i].username ===
        senderGroupMessageArray[senderGroupMessageArray.length - 1][0].username
      ) {
        senderGroupMessageArray[senderGroupMessageArray.length - 1].push(
          messagesOfOneDay[i]
        );
      } else {
        senderGroupMessageArray.push([messagesOfOneDay[i]]);
      }
    }
    return senderGroupMessageArray;
  });

  return messageArrays
}
