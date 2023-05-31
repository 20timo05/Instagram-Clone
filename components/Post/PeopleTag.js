import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function PeopleTag({ username, x, y }) {
  // adjust position of tag so that it does not overflow
  const wrapperRef = useRef(null);
  const [wrapperPos, setWrapperPos] = useState({ left: x, top: y });
  const [trianglePos, setTrianglePos] = useState({
    left: "50%",
    rotate: false,
  });

  useEffect(() => {
    const padding = 10;

    const styles = window.getComputedStyle(wrapperRef.current);
    const height = parseInt(styles.height.replace("px", ""));
    const width = parseInt(styles.width.replace("px", ""));

    const parentSize = 650;

    // overflow left
    if (width / 2 > x) {
      setWrapperPos((prev) => ({ ...prev, left: padding + width / 2 }));
      setTrianglePos((prev) => ({
        ...prev,
        left: Math.max(x - padding, 30) + "px",
      }));
    }
    // overflows right
    else if (x + width / 2 > parentSize) {
      setWrapperPos((prev) => ({
        ...prev,
        left: parentSize - width / 2 - padding,
      }));
      setTrianglePos((prev) => ({
        ...prev,
        left: Math.min(x - (parentSize - width - padding), width - 30) + "px",
      }));
    }

    // overflows bottom
    if (y + height + 20 > parentSize) {
      setWrapperPos((prev) => ({
        ...prev,
        top: parentSize - height - padding - 40,
      }));
      setTrianglePos((prev) => ({ ...prev, rotate: true }));
    }
  }, [x, y, username, wrapperRef]);

  return (
    <>
      <style jsx>{`
        .wrapper {
          position: absolute;
          top: ${wrapperPos.top}px;
          left: ${wrapperPos.left}px;
          translate: -50% 20px;
          background: rgba(50, 50, 50, 0.9);
          border-radius: 5px;
          padding: 0.75rem;
          color: white;
          cursor: pointer;
          scale: 0;
          animation: scaleIn 0.3s ease-in-out forwards;
        }

        .wrapper::after {
          content: "";
          display: block;
          height: 0;
          width: 0;
          position: absolute;
          top: 0;
          left: ${trianglePos.left};
          translate: -50% -100%;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-bottom: 20px solid rgba(50, 50, 50, 0.9);
        }

        .wrapper.rotate::after {
          rotate: 180deg;
          top: 100%;
          translate: -50% 0;
        }

        @keyframes scaleIn {
          80% {
            scale: 1.2;
          }
          100% {
            scale: 1;
          }
        }
      `}</style>
      <Link href={`/${username}`}>
        <div
          className={`wrapper ${trianglePos.rotate ? "rotate" : ""}`}
          ref={wrapperRef}
        >
          {username}
        </div>
      </Link>
    </>
  );
}
