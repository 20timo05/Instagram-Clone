import { useState } from "react";

import styles from "./inboxPageStyles.module.css";
import ChatProfileImage from "./ChatProfileImage";
import Button from "../little/Button";
import Chat from "./Chat";

import formatTime from "../../lib/formatTime";

export default function InboxPage(props) {
  const [openChatId, setOpenChatId] = useState(props.openChatId);

  const openedChatUsers =
    openChatId !== null &&
    props.data.find(({ id }) => id === openChatId).group_members;
  const openedChatName = openedChatUsers && getChatName(openedChatUsers);

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
            <span>{openedChatName}</span>
            <i className="fa-solid fa-video"></i>
          </>
        )}
      </header>
      <aside>
        {props.data.map((chat, idx) => (
          <div
            key={chat.id}
            className={`${styles.chat} ${chat.id === openChatId && styles.active}`}
            onClick={() => setOpenChatId(chat.id)}
          >
            <ChatProfileImage users={chat.group_members} />
            <span>{getChatName(chat.group_members)}</span>
            <span>
              {chat.group_members.length > 1 ? `${chat.username}: ` : ""}
              {chat.value} • {formatTime(new Date(chat.created_at))}
            </span>
          </div>
        ))}
      </aside>
      {openChatId !== null ? (
        <Chat
          openChatId={openChatId}
          data={props.data}
          currentLoggedInUser={props.currentLoggedInUser}
        />
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

function getChatName(users) {
  if (users.length === 1) return users[0];
  if (users.length === 2) return `${users[0]} und ${users[1]}`;
  return users.join(", ");
}
