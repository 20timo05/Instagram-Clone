import { useState, useEffect, useRef } from "react";

import Liked from "./Liked";
import LoadingAnimation from "../../little/LoadingAnimation";

export default function AudioMessage(props) {
  const [play, setPlay] = useState(true);
  const [loading, setLoading] = useState(true);
  const [audio, setAudio] = useState(null);
  const timebarIndicatorRef = useRef(null);
  const [dragTimebarIndicator, setDragTimebarIndicator] = useState(false);

  const timeDisplayRef = useRef(null);
  let formattedDuration = "0:00";
  if (audio?.duration && audio.duration !== Infinity) {
    formattedDuration = new Date(Math.floor(audio?.duration) * 1000)
      ?.toISOString()
      .slice(15, 19);
  }

  useEffect(() => {
    setLoading(true);
    const audio = new Audio(
      `/api/getFiles/getChatMessageFile?${new URLSearchParams({
        username: props.username,
        filename: `${props.id}.wav`,
      })}`
    );

    audio.oncanplay = () => {
      setAudio(audio);
      setLoading(false);
    };

    audio.onplay = () => {
      setPlay(false);
      setCurrentTime();
    };
    audio.onpause = () => {
      setPlay(true);
      cancelAllAnimationFrames();
    };
    audio.onended = () => {
      setPlay(true);
      cancelAllAnimationFrames();
    };

    audio.ontimeupdate = () => {
      const seconds = Math.floor(audio.currentTime);
      const formattedSeconds = new Date(seconds * 1000)
        .toISOString()
        .slice(15, 19); // ss => mm:ss
      timeDisplayRef.current.innerHTML = formattedSeconds;
    };

    window.addEventListener("mouseup", mouseUpHandler);
    window.addEventListener("mousemove", mouseMoveHandler);

    return () => {
      window.removeEventListener("mouseup", mouseUpHandler);
      window.removeEventListener("mousemove", mouseMoveHandler);
    };
  }, [props.username, props.id]);

  function setCurrentTime() {
    requestAnimationFrame(setCurrentTime);
    setAudio((audio) => {
      timebarIndicatorRef.current.style.translate = `
        calc(${audio?.currentTime / audio?.duration || 0} * 100px - 50%) -50%`;
      return audio;
    });
  }

  function cancelAllAnimationFrames() {
    var id = window.requestAnimationFrame(function () {});
    while (id--) {
      window.cancelAnimationFrame(id);
    }
  }

  function handlePlayPause() {
    if (play) audio.play();
    else audio.pause();
  }

  const mouseUpHandler = () => {
    let shouldUpdateAudio = false;
    setDragTimebarIndicator((prev) => {
      shouldUpdateAudio = prev;
      return false;
    });

    // if indicator was not dragged, mouse up does not matter
    if (!shouldUpdateAudio) return;

    // if indicator was not moved, don't update audio
    const { relativePosition } = timebarIndicatorRef.current;
    if (!relativePosition) return;

    setAudio((audio) => {
      audio.currentTime =
        (audio.duration * relativePosition) / 100 || audio.currentTime;
      return audio;
    });
  };
  function mouseMoveHandler(evt) {
    let indicatorIsGrabbed = false;
    setDragTimebarIndicator((isGrabbed) => {
      indicatorIsGrabbed = isGrabbed;
      return isGrabbed;
    });
    // if indicator is not grabbed, mouse move does not matter
    if (!indicatorIsGrabbed) return;

    // get desired position of indicator based on mouse position
    const { left } =
      timebarIndicatorRef.current.parentNode.getBoundingClientRect();
    const relativePosition = evt.x - left;

    // move indicator to desired position and save it as attribute (to update audio currentTime onMouseUp)
    timebarIndicatorRef.current.style.translate = `calc(${relativePosition}px - 50%) -50%`;
    timebarIndicatorRef.current.relativePosition = relativePosition;
  }

  function timebarClickHandler(evt) {
    if (evt.target === timebarIndicatorRef.current) return;

    const { left } =
      timebarIndicatorRef.current.parentNode.getBoundingClientRect();
    const relativePosition = evt.clientX - left;

    setAudio((audio) => {
      audio.currentTime =
        (audio.duration * relativePosition) / 100 || audio.currentTime;
      return audio;
    });
    timebarIndicatorRef.current.style.translate = `calc(${relativePosition}px - 50%) -50%`;
  }
  return (
    <>
      <style jsx>{`
        .wrapper {
          position: relative;
          min-width: 230px;
          width: fit-content;
          max-width: 60%;
          padding: 1rem 2rem;
          border-radius: 1.5rem;
          background: var(--darkWhite);
          border: 1px solid var(--lightGrey);
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .wrapper.ownMessage {
          background: var(--lightGrey);
        }

        #timebar {
          height: 4px;
          width: 100px;
          background: var(--grey);
          border-radius: 5px;
          position: relative;
          cursor: pointer;
        }

        #timebar > span {
          height: 10px;
          width: 10px;
          border-radius: 50%;
          background: var(--darkGrey);
          position: absolute;
          top: 50%;
          left: 0;
          translate: -50% -50%;
          cursor: move;
          cursor: grab;
          transition: translate 0.1s linear;
        }

        #timebar > span:active {
          cursor: grabbing;
        }
      `}</style>
      {
        <>
          {loading && <LoadingAnimation />}
          <div
            style={{ display: loading ? "none" : "flex" }}
            className={`wrapper ${props.ownMessage && "ownMessage"}`}
            onClick={(evt) => {
              // on dbl click
              if (evt.detail === 2) props.onLike();
            }}
          >
            <PlayPauseButton
              play={play}
              handlePlayPause={handlePlayPause}
              ownMessage={props.ownMessage}
            />
            <div id="timebar" onClick={timebarClickHandler}>
              <span
                ref={timebarIndicatorRef}
                onMouseDown={() => {
                  setDragTimebarIndicator(true);
                  setPlay(true);
                  audio.pause();
                }}
              ></span>
            </div>
            <span ref={timeDisplayRef}>{formattedDuration}</span>
            {props.likes?.length > 0 && (
              <Liked
                users={props.likes}
                currentLoggedInUser={props.currentLoggedInUser}
              />
            )}
          </div>
        </>
      }
    </>
  );
}

function PlayPauseButton({ play, handlePlayPause, ownMessage }) {
  return (
    <>
      <style jsx>{`
        .playButton {
          height: 30px;
          width: 25px;
          background: var(--darkGrey);
          position: relative;
          cursor: pointer;
          border: none;
          overflow: hidden;
          scale: 0.8;
        }

        #whiteMiddle {
          height: 30px;
          width: 7px;
          position: absolute;
          top: 0;
          left: 50%;
          translate: -50%;
          background: ${ownMessage ? "var(--lightGrey)" : "var(--darkWhite)"};
          transition: 0.1s ease-in-out;
        }

        .playButton.play > #whiteMiddle {
          scale: 0 1;
        }

        .playButton::before,
        .playButton::after {
          content: "";
          width: 60px;
          height: 20px;
          background: ${ownMessage ? "var(--lightGrey)" : "var(--darkWhite)"};
          position: absolute;
          z-index: 5;
          transition: 0.2s ease-in-out;
          left: 0;
        }

        .playButton::before {
          top: 0;
          translate: 0 -200%;
          rotate: 30deg;
          transform-origin: bottom left;
        }

        .playButton::after {
          top: 100%;
          translate: 0 100%;
          rotate: -30deg;
          transform-origin: top left;
        }

        .playButton.play::before {
          translate: 0 -100%;
        }

        .playButton.play::after {
          translate: 0;
        }
      `}</style>
      <button
        className={`playButton ${play && "play"}`}
        onClick={handlePlayPause}
      >
        <div id="whiteMiddle"></div>
      </button>
    </>
  );
}
