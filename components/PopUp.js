import ClientOnlyPortal from "../lib/modal/ClientOnlyPortal";

export default function Popup({
  title,
  children,
  close,
  className,
  style,
  closeOnClick = false,
}) {
  const closeHandler = (evt) => {
    const clickOnOverlayNotPopUp = evt.target.classList.contains("overlay");
    if (clickOnOverlayNotPopUp) close();
  };

  return (
    <>
      <style jsx>{`
        .overlay {
          height: 100vh;
          width: 100vw;
          box-sizing: border-box;
          background: rgba(0, 0, 0, 0.7);
          position: fixed;
          top: 0;
          left: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
        }

        .wrapper {
          max-height: 80vh;
          overflow: auto;
          box-shadow: var(--boxShadow);
          background: white;
          border-radius: 10px;
          opacity: 0;
          scale: 0;
          animation: 0.2s ease-in-out forwards scaleIn;
        }

        @keyframes scaleIn {
          30% {
            scale: 1.5;
          }
          100% {
            scale: 1;
            opacity: 1;
          }
        }

        .header {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          border-bottom: 1px solid var(--lightGrey);
        }

        .header > i {
          cursor: pointer;
          margin-left: auto;
          margin-right: 1rem;
          font-size: 2rem;
        }

        .header > span {
          margin: 1rem 2rem;
          font-size: 1.5rem;
        }

        .content {
          padding: 0 1rem;
        }
      `}</style>
      <ClientOnlyPortal selector="#usersModal">
        <div
          className={`overlay ${className ? className : ""}`}
          onClick={closeHandler}
        >
          <section className="wrapper" style={style}>
            <header className="header">
              <span>{title}</span>
              <i onClick={close} className="fa-solid fa-xmark"></i>
            </header>
            <section
              className="content"
              {...(closeOnClick && { onClick: close })}
            >
              {children}
            </section>
          </section>
        </div>
      </ClientOnlyPortal>
    </>
  );
}
