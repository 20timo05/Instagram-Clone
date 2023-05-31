import { useEffect, useRef } from "react";

export default function DropdownMenu(props) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      wrapperRef.current?.classList.remove("notLoaded");
    }, 400);
  }, []);

  return (
    <>
      <style jsx>{`
        .wrapper.notLoaded {
          max-height: 3.5rem !important;
        }

        .wrapper {
          max-height: 3.5rem;
          width: 100%;
          border-bottom: 1px solid var(--lightGrey);
          overflow-y: hidden;
          cursor: pointer;
        }

        .wrapper > header {
          height: 3.5rem;
          font-weight: bolder;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: white;
        }

        .wrapper > header > i {
          transition: rotate 0.2s ease-in-out;
        }

        .wrapper > footer {
          width: 100%;
          padding: 1rem;
          margin-top: -2rem;
        }

        .wrapper.showContent > header > i {
          rotate: -180deg;
        }

        .wrapper.showContent {
          max-height: 100rem;
          transition: max-height 0.9s ease-in-out;
        }

        .wrapper:not(.showContent) {
          animation-name: shrink;
          animation-duration: 0.9s;
          animation-delay: calc(0.9s * -0.65);
        }

        @keyframes shrink {
          0% {
            max-height: 100rem;
          }
          100% {
            max-height: 3.5rem;
          }
        }
      `}</style>
      <section className="wrapper notLoaded" ref={wrapperRef}>
        <header
          onClick={() => wrapperRef?.current.classList.toggle("showContent")}
        >
          {props.title}
          <i className="fa-solid fa-chevron-down"></i>
        </header>
        <footer>{props.children}</footer>
      </section>
    </>
  );
}
