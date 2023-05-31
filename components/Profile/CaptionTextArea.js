import { useEffect, useRef } from "react";

import EmoticonMenu from "../Post/EmoticonMenu";

import useLooseFocus from "../../hooks/useLooseFocus";

export default function CaptionTextArea({
  caption,
  setCaption,
  maxLength,
  captionRef,
}) {
  let captionRef2 = useRef(null);
  useEffect(() => {
    if (captionRef) captionRef2 = captionRef;
  }, []);
  const emojiToggleRef = useRef(null);
  const emojiRef = useRef(null);
  const [emojiMenuFocus, setEmojiMenuFocus] = useLooseFocus(
    [emojiToggleRef],
    [emojiRef]
  );

  const addEmojiHandler = (emoji) => {
    setCaption(captionRef2.current.value + emoji);
    captionRef2.current?.focus();
  };

  const formattedMaxLength = maxLength.toLocaleString().replace(/,/g, ".");

  return (
    <>
      <style jsx>{`
        .wrapper {
          border: 1px solid var(--lightGrey);
          border-radius: 5px;
          padding: 0.5rem;
          display: flex;
          flex-direction: column;
        }

        .caption {
          resize: none;
          outline: none;
          border: none;
          background: transparent;
          font-family: inherit;
          height: 150px;
          width: 100%;
        }

        .wrapper > div {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .wrapper > div > section {
          rotate: 180deg;
          translate: calc(-1rem - 10px) calc(50% + 40px) !important;
          padding-left: 0;
          padding-right: 1rem;
        }

        .wrapper > div > svg {
          cursor: pointer;
        }
      `}</style>
      <div className="wrapper">
        <textarea
          row="10"
          placeholder="Bildunterschrift verfassen..."
          className="caption"
          ref={captionRef2}
          value={caption}
          onChange={(evt) => {
            if (evt.target.value.length <= maxLength)
              setCaption(evt.target.value);
          }}
          onKeyDown={(evt) => {
            if (evt.key === "Enter")
              captionRef2.current.value += "\n";
          }}
        />
        <div>
          {emojiMenuFocus && (
            <EmoticonMenu ref={emojiRef} addEmoji={addEmojiHandler} />
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
          <span>
            {captionRef2.current?.value.length}/{formattedMaxLength}
          </span>
        </div>
      </div>
    </>
  );
}
