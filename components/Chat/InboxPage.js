import { useState, Fragment } from "react";

import styles from "./inboxPageStyles.module.css";
import ChatProfileImage from "./ChatProfileImage";
import Button from "../little/Button";
import Chat from "./Chat";

import formatTime from "../../lib/formatTime";
import useChat from "./useChat";

export default function InboxPage(props) {
  const [openChatId, setOpenChatId] = useState(props.openChatId);

  const { onlineUsers = [], ...chatProps } = useChat(
    openChatId,
    props.data,
    props.currentLoggedInUser
  );

  const openedChatUsers =
    openChatId !== null &&
    props.data.find(({ id }) => id === openChatId).group_members;
  const openedChatName = openedChatUsers && getChatName(openedChatUsers, onlineUsers);
  
  return (
    <div className={styles.wrapper}>
      <div>
        <span>{props.currentLoggedInUser.username}</span>
        <i className="fa-regular fa-pen-to-square"></i>
      </div>
      <header>
        {openChatId !== null && (
          <>
            <ChatProfileImage users={openedChatUsers} />
            <span className={styles.chatNameWrapper}>{openedChatName}</span>
            <i className="fa-solid fa-video"></i>
          </>
        )}
      </header>
      <aside>
        {props.data.map((chat, idx) => (
          <div
            key={chat.id}
            className={`${styles.chat} ${
              chat.id === openChatId && styles.active
            }`}
            onClick={() => setOpenChatId(chat.id)}
          >
            <ChatProfileImage users={chat.group_members} />
            <span className={styles.chatNameWrapper}>{getChatName(chat.group_members, onlineUsers)}</span>
            <span>
              {chat.group_members.length > 1 ? `${chat.username}: ` : ""}
              {chat.value} • {formatTime(new Date(chat.created_at))}
            </span>
          </div>
        ))}
      </aside>
      {openChatId !== null ? (
        <Chat {...chatProps} />
      ) : (
        <section>
          <div className={styles.startChat}>
            <div>
              <i className="fa-regular fa-paper-plane"></i>
            </div>
            <h3>Deine Nachricht</h3>
            <p>
              Sende private Fotos und Nachrichten an deine Freunde oder eine
              Gruppe.
            </p>
            <Button value="Nachricht senden" onClick={console.log} />
          </div>
        </section>
      )}
    </div>
  );
}

function getChatName(users, onlineUsers = []) {
  const usernameJSX = (username) => (
    <span className={onlineUsers.includes(username) ? styles.online : ""}>
      {username}
    </span>
  );
  if (users.length === 1) return usernameJSX(users[0]);
  if (users.length === 2) {
    return (
      <>
        {usernameJSX(users[0])} und {usernameJSX(users[1])}
      </>
    );
  }

  return users.map((username, idx) => (
    <Fragment key={username}>
      {idx > 0 && ", "}
      {usernameJSX(username)}
    </Fragment>
  ));
}
