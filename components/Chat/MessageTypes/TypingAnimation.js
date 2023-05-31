export default function TypingAnimation() {
  return (
    <>
      <style jsx>{`
        .wrapper {
          display: flex;
          width: fit-content;
          gap: 0.5rem;
          padding: 1rem;
          border: 1px solid var(--lightGrey);
          border-radius: 100px;
        }

        .wrapper > span {
          height: 10px;
          width: 10px;
          border-radius: 50%;
          background: var(--lightGrey);
          animation: typingAnimation;
          animation-duration: 1.8s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .wrapper > span:nth-child(2) {
          animation-delay: 150ms;
        }
        .wrapper > span:nth-child(3) {
          animation-delay: 300ms;
        }

        @keyframes typingAnimation {
          0% {
            translate: 0;
            background: var(--lightGrey);
          }
          25% {
            translate: 0 -7px;
            background: var(--darkGrey);
          }
          50% {
            translate: 0;
            background: var(--lightGrey);
          }
        }
      `}</style>
      <div className="wrapper">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </>
  );
}
