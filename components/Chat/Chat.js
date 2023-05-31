import { useState, useEffect, Fragment, useRef } from "react";

import ChatDayMessage from "./ChatDayMessage";
import UserChatMessages from "./UserChatMessages";
import WriteComment from "../Post/WriteComment";
import styles from "./chatStyles.module.css";
import { fetchData } from "../../hooks/useFetch";
import usePusher from "../../hooks/usePusher";

export default ({ openChatIdx, data, currentLoggedInUser }) => {
  const chatMsgWrapperRef = useRef(null);
  const [chatsData, setChatsData] = useChatsData(data, openChatIdx);
  const [isTyping, setIsTyping] = useState(null);
  
  const [pusherChatsData, sendMessage, typingUser] = usePusher(
    chatsData,
    chatsData[openChatIdx].id,
    currentLoggedInUser.username,
    isTyping
  );

  const messageArrays = structureMessages(pusherChatsData, openChatIdx);

  const scrollBottom = () =>
    chatMsgWrapperRef.current.scrollTo(
      0,
      chatMsgWrapperRef.current.scrollHeight
    );
  useEffect(scrollBottom, [messageArrays]);

  return (
    <section className={styles.wrapper}>
      <section ref={chatMsgWrapperRef}>
        {messageArrays.map((messagesOfOneDay) => (
          <Fragment key={messagesOfOneDay[0][0].created_at}>
            <ChatDayMessage timestamp={messagesOfOneDay[0][0].created_at} />
            {messagesOfOneDay.map((userMessages) => (
              <UserChatMessages
                key={userMessages[0].id}
                userMessages={userMessages}
                currentLoggedInUser={currentLoggedInUser}
                setChatsData={setChatsData}
              />
            ))}
          </Fragment>
        ))}
        {typingUser && (
          <UserChatMessages
            userMessages={[{ username: typingUser, message_type: "typing" }]}
            currentLoggedInUser={currentLoggedInUser}
          />
        )}
      </section>
      <footer>
        <WriteComment
          submitHandler={sendMessage}
          buttonValue="Senden"
          placeholder="Nachricht schreiben ..."
          setTyping={setIsTyping}
        />
      </footer>
    </section>
  );
};

function structureMessages(chatsData, openChatIdx) {
  // group chat messages by the day of creation
  let messageArrays = [];
  if (chatsData[openChatIdx].chatMessages) {
    const messageGroups = {};
    for (const message of chatsData[openChatIdx].chatMessages) {
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
          senderGroupMessageArray[senderGroupMessageArray.length - 1][0]
            .username
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
  }

  return messageArrays;
}

function useChatsData(data, openChatIdx) {
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
      newPrev[openChatIdx].chatMessages = data;
      return newPrev;
    });
  }

  useEffect(() => {
    if (chatsData[openChatIdx].chatMessages) return;

    // fetch chat Messages
    fetchMessages(chatsData[openChatIdx].id);
  }, [openChatIdx]);

  return [chatsData, setChatsData]
}
