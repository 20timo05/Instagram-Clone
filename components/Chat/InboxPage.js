import { useState } from "react";

import styles from "./inboxPageStyles.module.css";
import ChatProfileImage from "./ChatProfileImage";
import Button from "../little/Button";
import Chat from "./Chat";

import formatTime from "../../lib/formatTime";

export default function InboxPage({ data, currentLoggedInUser }) {
  const [openChatIdx, setOpenChatIdx] = useState(0);
  
  const users = openChatIdx !== null && data[openChatIdx].group_members;
  const chatName = users && getChatName(users);

  return (
    <div className={styles.wrapper}>
      <div>
        <span>{currentLoggedInUser.username}</span>
        <i className="fa-regular fa-pen-to-square"></i>
      </div>
      <header>
        {openChatIdx !== null && (
          <>
            <ChatProfileImage users={users} />
            <span>{chatName}</span>
            <i className="fa-solid fa-video"></i>
          </>
        )}
      </header>
      <aside>
        {data.map((chat, idx) => (
          <div
            key={chat.id}
            className={styles.chat}
            onClick={() => setOpenChatIdx(idx)}
          >
            <ChatProfileImage users={chat.group_members} />
            <span>{chatName}</span>
            <span>
              {chat.group_members.length > 1 ? `${chat.username}: ` : ""}
              {chat.value} • {formatTime(new Date(chat.created_at))}
            </span>
          </div>
        ))}
      </aside>
      {openChatIdx !== null ? (
        <Chat
          openChatIdx={openChatIdx}
          data={data}
          currentLoggedInUser={currentLoggedInUser}
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
