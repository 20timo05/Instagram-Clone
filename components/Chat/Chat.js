import { useState, useEffect, Fragment, useRef } from "react";
import Image from "next/image";

import ChatDayMessage from "./ChatDayMessage";
import UserChatMessages from "./UserChatMessages";
import WriteComment from "../Post/WriteComment";
import AudioRecorder from "./AudioRecorder";
import styles from "./chatStyles.module.css";

import { fetchData } from "../../hooks/useFetch";
import usePusher from "../../hooks/usePusher";

export default function Chat({ openChatIdx, data, currentLoggedInUser }) {
  const chatMsgWrapperRef = useRef(null);
  const [chatsData, setChatsData] = useChatsData(data, openChatIdx);
  const [isTyping, setIsTyping] = useState(null);

  const [recording, setRecording] = useState(false);

  const [pusherChatsData, sendMessage, typingUser] = usePusher(
    chatsData,
    chatsData[openChatIdx].id,
    currentLoggedInUser.username,
    isTyping
  );

  const messageArrays = structureMessages(pusherChatsData, openChatIdx);

  const inputRef = useRef(null);
  const [files, setFiles] = useState([]);

  const scrollBottom = () =>
    chatMsgWrapperRef.current.scrollTo(
      0,
      chatMsgWrapperRef.current.scrollHeight
    );
  useEffect(scrollBottom, [messageArrays]);

  function submitAudioHandler(audioBlob) {
    setRecording(false);
    setIsTyping(false);
    sendMessage(audioBlob, "file");
  }

  async function uploadImageHandler(evt) {
    const { files } = evt.target;

    const filesWithSrc = [];
    for (let file of files)
      filesWithSrc.push([URL.createObjectURL(file), file]);

    setFiles((prev) => [
      ...prev,
      // filter to prevent duplicates
      ...filesWithSrc.filter(
        ([src, { name }]) =>
          !prev.find(([src, { name: prevName }]) => prevName === name)
      ),
    ]);
  }
  function removeFileHandler(src) {
    setFiles((prev) => prev.filter(([prevSrc]) => prevSrc !== src));
  }

  function submitHandler(val) {
    for (let [blob, file] of files) {
      sendMessage(file, "file");
    }
    if (val.length > 0) sendMessage(val, "text");
    setFiles([]);
  }

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
      {recording ? (
        <AudioRecorder
          stop={() => setRecording(false)}
          submit={submitAudioHandler}
        />
      ) : (
        <footer>
          {files.length > 0 && (
            <div className={styles.filesPreview}>
              {files.map(([src, file]) => (
                <div key={src}>
                  <div onClick={() => removeFileHandler(src)}>✖</div>
                  {file.type === "video/mp4" ? (
                    <video src={src}></video>
                  ) : (
                    <Image src={src} fill alt="Image Preview" />
                  )}
                </div>
              ))}
              <div
                onClick={() => inputRef?.current?.click()}
                title="Ein weiteres Foto/ Video hochladen"
              >
                <i className="fa-regular fa-images"></i>
              </div>
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg, image/png, video/mp4"
            style={{ display: "none" }}
            ref={inputRef}
            multiple={true}
            onChange={uploadImageHandler}
          />
          <WriteComment
            submitHandler={submitHandler}
            buttonValue="Senden"
            placeholder="Nachricht schreiben ..."
            setTyping={setIsTyping}
            hideButtonAlternative={files.length > 0}
            sendButtonAlternative={
              <div className={styles.otherMessageTypesIconsWrapper}>
                <i
                  className="fa-solid fa-microphone"
                  onClick={() => {
                    setRecording(true);
                    setIsTyping(true);
                  }}
                ></i>
                <i
                  className="fa-regular fa-image"
                  onClick={() => inputRef?.current?.click()}
                ></i>
              </div>
            }
          />
        </footer>
      )}
    </section>
  );
}

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

  return [chatsData, setChatsData];
}
