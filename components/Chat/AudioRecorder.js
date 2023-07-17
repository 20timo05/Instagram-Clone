import { useState, useEffect, useRef } from "react";

import handleMicroSuccess from "../../lib/audioVolumeVisualizerHelpers"

export default function AudioRecorder({ stop, submit }) {
  const canvasRef = useRef(null);
  const [audioLength, setAudioLength] = useState(0);
  const date = new Date(null);
  date.setSeconds(Math.floor(audioLength / 10));
  const formattedAudioLength = date.toISOString().slice(14, 19);

  // if recording is aborted => stop the recording but don't save the audio
  const mediaRecorderRef = useRef(null);
  const abortRecordingRef = useRef(false);

  useEffect(() => {
    let interval;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        try {
          // start recording
          mediaRecorderRef.current = new MediaRecorder(stream);
          let recorderChunks = [];

          mediaRecorderRef.current.ondataavailable = (evt) =>
            recorderChunks.push(evt.data);
          mediaRecorderRef.current.onstop = () => {
            if (abortRecordingRef.current === false) {
              saveAudioHandler(recorderChunks);
            }
          };
          mediaRecorderRef.current.start();

          interval = handleMicroSuccess(stream, canvasRef, setAudioLength);
        } catch (e) {
          alert("Web Audio API not supported.");
        }
      })
      .catch(function (err) {
        console.error("Error accessing microphone:", err);
        stop();
      });

    return () => {
      // save audio
      abortRecordingRef.current = true;
      mediaRecorderRef.current.stop();

      // clear interval and animation frame
      clearInterval(interval);

      let id = window.requestAnimationFrame(function () {});
      while (id--) {
        window.cancelAnimationFrame(id);
      }
    };
  }, []);

  function saveAudioHandler(recorderChunks) {
    const blob = new Blob(recorderChunks, { type: "audio/wav" });
    recorderChunks = [];
    submit(blob);
  }

  return (
    <>
      <style jsx>{`
        .wrapper {
          background: rgb(20, 232, 255);
          background: var(--audioGradient);
          padding: 0.5rem;
          animation: slideIn 0.2s forwards ease-in-out;
          transform-origin: 0 50%;
          display: flex;
          flex-direction: row;
          gap: 1rem;
          color: white;
        }

        .wrapper > i {
          height: 2.5rem;
          min-width: 2.5rem;
          font-size: 1.5rem;
          background: var(--darkWhite);
          color: var(--grey);
          border-radius: 50%;
          cursor: pointer;
          display: grid;
          place-items: center;
        }

        .wrapper > canvas {
          height: 100%;
          max-height: 60px;
          width: 100%;
        }

        @keyframes slideIn {
          0% {
            scale: 0 1;
          }
          100% {
            scale: 1;
          }
        }
      `}</style>
      <footer className="wrapper">
        <i onClick={stop} className="fa-regular fa-trash-can"></i>
        <canvas ref={canvasRef}></canvas>
        <span>{formattedAudioLength}</span>
        <i
          className="fa-solid fa-arrow-up"
          onClick={() => {
            mediaRecorderRef.current?.stop()
          }}
        ></i>
      </footer>
    </>
  );
}
