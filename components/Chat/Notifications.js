import { useState } from "react";
import ProfileImage from "../../components/little/ProfileImage";
import Link from "next/link";

import usePusher from "../../hooks/usePusher";
import useFetch from "../../hooks/useFetch";
import styles from "./notificationsStyles.module.css";

export default function Notifications({ currentLoggedInUser }) {
  const [chatsData, setChatsData, loading, error] = useFetch(
    "GET",
    "/api/inbox/getChats",
    { userId: currentLoggedInUser.id }
  );

  const [chats, sendMessage] = usePusher(
    chatsData,
    null,
    currentLoggedInUser.username,
    null,
    incomingMsgHandler
  );

  const [newMsgs, setNewMsgs] = useState([]);
  const TIME_POPUP_VISIBLE = 5000;

  function incomingMsgHandler(data) {
    if (data.sender === currentLoggedInUser.username) return;
    const value =
      data.message_type === "text"
        ? data.value
        : data.message_type === "post"
        ? "weitergeleiteter Post"
        : data.message_type === "file"
        ? data.filetype
        : "";

    setNewMsgs((prev) => {
      const tempId = Math.max(...prev.map((msg) => msg.id), 0) + 1;
      return [
        ...prev.slice(-2),
        {
          id: tempId,
          value,
          sender: data.sender,
          chatId: data.chatId,
          timeout: setTimeout(() => {
            // remove again after time period
            setNewMsgs((prev) => prev.filter(({ id }) => id !== tempId));
          }, TIME_POPUP_VISIBLE),
        },
      ];
    });
  }

  function submitHandler(evt, chatId, id) {
    evt.preventDefault();
    let value =
      evt.type === "click"
        ? evt.target.previousSibling.value
        : evt.target.value;

    sendMessage(value, "text", chatId);
    removeNotifHandler(evt, id);
  }

  function removeNotifHandler(evt, id) {
    evt.preventDefault();
    setNewMsgs((prev) => prev.filter((msg) => msg.id !== id));
  }

  function focusHandler(id) {
    clearTimeout(newMsgs.find((msg) => msg.id === id).timeout);
  }

  function blurHandler(id) {
    setNewMsgs((prev) => {
      const newPrev = [...prev];
      const msg = newPrev.find((msg) => msg.id === id);
      msg.timeout = setTimeout(() => {
        // remove again after time period
        setNewMsgs((prev) => prev.filter((msg) => msg.id !== id));
      }, TIME_POPUP_VISIBLE);
      return newPrev;
    });
  }

  return (
    <section className={styles.notificationsWrapper}>
      {newMsgs.map((msg) => (
        <Link href={`/inbox?openChat=1`} key={msg.id}>
          <div className={styles.newMessage}>
            <span
              className={styles.close}
              onClick={(evt) => removeNotifHandler(evt, msg.id)}
            >
              ✖
            </span>
            <ProfileImage
              username={msg.sender}
              height="50"
              width="50"
              style={{ gridRow: "1 / 4", alignSelf: "center" }}
            />
            <h3>Neue Nachricht von {msg.sender}!</h3>
            <p>{msg.value}</p>
            <form
              className={styles.quickResponse}
              onClick={(evt) => evt.preventDefault()}
            >
              <input
                type="text"
                placeholder="Antworten..."
                onFocus={() => focusHandler(msg.id)}
                onBlur={() => blurHandler(msg.id)}
                onKeyDown={(evt) =>
                  evt.key === "Enter" && submitHandler(evt, msg.chatId, msg.id)
                }
              />
              <i
                onClick={(evt) => submitHandler(evt, msg.chatId, msg.id)}
                className="fa-solid fa-paper-plane"
              ></i>
            </form>
          </div>
        </Link>
      ))}
    </section>
  );
}
