import ProfileImage from "../little/ProfileImage";
import TextMessage from "./MessageTypes/TextMessage";
import AudioMessage from "./MessageTypes/AudioMessage";
import PostMessage from "./MessageTypes/PostMessage";
import ImageOrVideoMessage from "./MessageTypes/ImageOrVideoMessage"
import TypingAnimation from "./MessageTypes/TypingAnimation";
import { fetchData } from "../../hooks/useFetch";

export default function UserChatMessages({
  userMessages,
  currentLoggedInUser,
  setChatsData,
}) {
  const username = userMessages[0].username;
  const ownMessage = username === currentLoggedInUser.username;

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
      <div className={`wrapper ${ownMessage ? "right" : ""}`}>
        <span>{username}</span>
        {userMessages.map((message) => {
          const props = {
            key: message.id,
            ownMessage,
            currentLoggedInUser,
            likes: message.likes,
            onLike: () => likeHandler(message),
          };
          const fileType =
            message.message_type === "file"
              ? message.value.substring(0, message.value.indexOf("/"))
              : message.message_type;

          return fileType === "text" ? (
            <TextMessage value={message.value} {...props} />
          ) : fileType === "audio" ? (
            <AudioMessage
              id={message.id}
              username={message.username}
              {...props}
            />
          ) : fileType === "post" ? (
            <PostMessage postId={message.post_id} {...props} />
          ) : fileType === "image" || fileType === "video" ? (
            <ImageOrVideoMessage
              id={message.id}
              username={message.username}
              type={message.value}
              {...props}
            />
          ) : (
            fileType === "typing" && <TypingAnimation key={username} />
          );
        })}
        <ProfileImage
          username={username}
          height={30}
          width={30}
          style={{
            translate: ownMessage ? "125% -100%" : "-125% -100%",
          }}
        />
      </div>
    </>
  );
}
