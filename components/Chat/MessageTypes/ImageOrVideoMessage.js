import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import Liked from "./Liked";

export default function ImageOrVideoMessage(props) {
  const modalRef = useRef(null);

  const [fileType, fileTypeEnding] = props.type.split("/");

  const src = `/api/getFiles/getChatMessageFile?${new URLSearchParams({
    username: props.username,
    filename: `${props.id}.${fileTypeEnding}`,
  })}`;
  return (
    <>
      <style jsx>{`
        .wrapper {
          width: calc(236px * ${props.scale || 1});
          aspect-ratio: 1.3;
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
        }

        .wrapper > img,
        .wrapper > video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .wrapper::after {
          content: "▶";
          z-index: 3;
          position: absolute;
          top: 0;
          right: 0;
          translate: -50% 25%;
          color: white;
          font-size: 1.7rem;
        }

        dialog {
          padding: 0;
          border: none;
          background: none;
          height: 100vh;
          width: 100vw;
        }

        dialog > div {
          position: absolute;
          top: 50%;
          left: 50%;
          translate: -50% -50%;
          display: grid;
          place-items: center;
        }

        dialog > div,
        dialog > div > video {
          max-height: 50vh;
          max-width: 90vw;
          min-height: 50vh;
          min-width: 90vw;
        }

        dialog::backdrop {
          background: rgb(0, 0, 0, 0.7);
        }

        dialog::after {
          content: "⨉";
          color: white;
          position: absolute;
          top: 0;
          right: 0;
          font-size: 1.5rem;
          cursor: pointer;
        }
      `}</style>
      <div className="wrapper" onClick={() => modalRef.current.showModal()}>
        {fileType === "image" ? (
          <Image
            alt={props.type}
            src={src}
            fill
            style={{ zIndex: "5", background: "var(--darkWhite)" }}
          />
        ) : (
          <video alt={props.type} src={src}></video>
        )}
      </div>
      <dialog
        ref={modalRef}
        className="modal"
        onClick={() => modalRef.current.close()}
      >
        <div>
          {fileType === "image" ? (
            <Image
              alt={props.type}
              src={src}
              fill={true}
              style={{ objectFit: "contain" }}
            />
          ) : (
            <video
              alt={props.type}
              src={src}
              style={{ objectFit: "contain" }}
            ></video>
          )}
        </div>
      </dialog>
    </>
  );
}

function useVideoThumbnail(src, type) {
  const [thumbnailSrc, setThumbnailSrc] = useState(src);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function generateThumbnail() {
      try {
        const video = document.createElement("video");
        video.src = src;
        video.crossOrigin = "anonymous";

        await video.load();
        video.currentTime = 0;
        //await video.play();

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const thumbnailDataUrl = canvas.toDataURL("image/png");
        setThumbnailSrc(thumbnailDataUrl);
        setLoading(false);
      } catch (error) {
        console.error("Error generating video thumbnail:", error);
        setError(error);
      }
    }

    if (type === "video") generateThumbnail();
  }, [src, type]);

  return [thumbnailSrc, loading, error];
}
