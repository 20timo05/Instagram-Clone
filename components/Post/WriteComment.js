import { useState, useEffect, useRef } from "react";

import EmoticonMenu from "./EmoticonMenu";
import styles from "./writeComment.module.css";
import useLooseFocus from "../../hooks/useLooseFocus";
import { fetchData } from "../../hooks/useFetch";

export default function WriteComment(props) {
  const [textAreaValue, setTextAreaValue] = useState("");
  const [submitDeactivated, setSubmitDeactivated] = useState(true);
  const textAreaRef = useRef(null);

  const emojiToggleRef = useRef(null);
  const emojiRef = useRef(null);
  const [emojiMenuFocus, setEmojiMenuFocus] = useLooseFocus(
    [emojiToggleRef],
    [emojiRef]
  );

  const textAreaChangeHandler = (evt) => {
    evt.target.style.height = "1px";
    evt.target.style.height = `${evt.target.scrollHeight}px`;
    setSubmitDeactivated(evt.target.value.length === 0);
    setTextAreaValue(evt.target.value);
    props.setTyping(evt.target.value.length > 0);
  };

  useEffect(() => {
    if (props.responseMode && textAreaRef?.current) textAreaRef.current.focus();
  }, [props.responseMode, textAreaRef]);

  const postCommentHandler = async (evt) => {
    evt.preventDefault();
    const textArea = evt.target.children[1];
    const commentText = textArea.value;
    setTextAreaValue("");
    textArea.focus();

    if (props.submitHandler) return props.submitHandler(commentText);

    const res = await fetchData("POST", "/api/posts/createComment", {
      responseMode: props.responseMode,
      postId: props.postId,
      comment: commentText,
      commentId: props.responseMode.commentId,
    });

    if (!res.ok) {
      console.log(res.error);
      return;
    }
    console.log(res.data);

    props.addTemporaryCommentHandler(
      props.responseMode,
      res.data.id,
      commentText
    );
  };

  const addEmojiHandler = (emoji) => {
    setTextAreaValue((prev) => prev + emoji);
    setSubmitDeactivated(false);
    textAreaRef?.current?.focus();
  };

  return (
    <footer className={styles.footer}>
      <div
        className={`${styles.responseMode} ${
          props.responseMode ? styles.active : ""
        }`}
      >
        Antwort an {props.responseMode ? props.responseMode.username : ""}
        <i
          className="fa-solid fa-xmark"
          onClick={() => props.setResponseMode(false)}
        ></i>
      </div>
      <form onSubmit={postCommentHandler}>
        {/* emojy straight and emoticons from instagram */}
        {emojiMenuFocus && (
          <EmoticonMenu useRef={emojiRef} addEmoji={addEmojiHandler} />
        )}
        <svg
          aria-label="Emoji"
          color="#262626"
          fill="#262626"
          height="24"
          role="img"
          viewBox="0 0 24 24"
          width="24"
          ref={emojiToggleRef}
        >
          <path d="M15.83 10.997a1.167 1.167 0 1 0 1.167 1.167 1.167 1.167 0 0 0-1.167-1.167Zm-6.5 1.167a1.167 1.167 0 1 0-1.166 1.167 1.167 1.167 0 0 0 1.166-1.167Zm5.163 3.24a3.406 3.406 0 0 1-4.982.007 1 1 0 1 0-1.557 1.256 5.397 5.397 0 0 0 8.09 0 1 1 0 0 0-1.55-1.263ZM12 .503a11.5 11.5 0 1 0 11.5 11.5A11.513 11.513 0 0 0 12 .503Zm0 21a9.5 9.5 0 1 1 9.5-9.5 9.51 9.51 0 0 1-9.5 9.5Z"></path>
        </svg>
        <textarea
          placeholder={
            props.placeholder || props.responseMode
              ? "Antworten..."
              : "Kommentieren..."
          }
          className={styles.writeComment}
          value={textAreaValue}
          onChange={textAreaChangeHandler}
          ref={textAreaRef}
        ></textarea>
        {!props.sendButtonAlternative ||
        textAreaValue.length > 0 ||
        props.hideButtonAlternative ? (
          <button
            type="submit"
            className={`${styles.post} ${
              submitDeactivated && !props.hideButtonAlternative ? styles.deactivated : ""
            }`}
          >
            {props.buttonValue || "Posten"}
          </button>
        ) : (
          props.sendButtonAlternative
        )}
      </form>
    </footer>
  );
}
