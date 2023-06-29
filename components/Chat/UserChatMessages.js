import ProfileImage from "../little/ProfileImage";
import TextMessage from "./MessageTypes/TextMessage";
import AudioMessage from "./MessageTypes/AudioMessage"
import TypingAnimation from "./MessageTypes/TypingAnimation";
import { fetchData } from "../../hooks/useFetch";

export default function UserChatMessages({
  userMessages,
  currentLoggedInUser,
  setChatsData,
}) {
  const username = userMessages[0].username;
  const ownMessages = username === currentLoggedInUser.username;

  const likeHandler = async (message) => {
    const { id, likes } = message;
    const likeStatus = !!likes?.find(
      (like) => like.username === currentLoggedInUser.username
    );

    const { ok, data, error } = await fetchData(
      "POST",
      "/api/inbox/setMessageLike",
      { messageId: id, likeStatus: !likeStatus }
    );

    if (!ok) return console.log(error);

    setChatsData((prev) => {
      const newPrev = [...prev];
      for (let i = 0; i < newPrev.length; i++) {
        const { chatMessages } = newPrev[i];
        if (!chatMessages) continue;

        const chatMessageIdx = chatMessages.findIndex((msg) => msg.id === id);
        if (chatMessageIdx === -1) continue;
        const likes = chatMessages[chatMessageIdx].likes;

        // remove like
        if (likeStatus)
          likes.splice(
            likes.findIndex(
              (like) => like.username === currentLoggedInUser.username
            ),
            1
          );
        else if (!likes?.includes(currentLoggedInUser)) {
          // add like
          chatMessages[chatMessageIdx].likes = (
            chatMessages[chatMessageIdx].likes || []
          ).concat(currentLoggedInUser);
        }
      }
      return newPrev;
    });
  };

  return (
    <>
      <style jsx>{`
        .wrapper {
          position: relative;
          margin-left: calc(1rem + 30px);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .wrapper > span {
          color: var(--grey);
        }

        .wrapper.right {
          align-items: flex-end;
          margin-right: calc(1rem + 30px);
        }
      `}</style>
      <div className={`wrapper ${ownMessages ? "right" : ""}`}>
        <span>{username}</span>
        {userMessages.map((message) =>
          message.message_type === "text" ? (
            <TextMessage
              key={message.id}
              value={message.value}
              ownMessage={ownMessages}
              currentLoggedInUser={currentLoggedInUser}
              likes={message.likes}
              onLike={() => likeHandler(message)}
            />
          ) : message.message_type === "audio" ? (
            <AudioMessage
              key={message.id}
              id={message.id}
              username={message.username}
              ownMessage={ownMessages}
              currentLoggedInUser={currentLoggedInUser}
              likes={message.likes}
              onLike={() => likeHandler(message)}
            />
          ) : (
            message.message_type === "typing" && (
              <TypingAnimation key={username} />
            )
          )
        )}
        <ProfileImage
          username={username}
          height={30}
          width={30}
          style={{
            translate: ownMessages ? "125% -100%" : "-125% -100%",
          }}
        />
      </div>
    </>
  );
}
