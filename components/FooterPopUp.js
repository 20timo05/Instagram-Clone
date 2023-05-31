import ClientOnlyPortal from "../lib/modal/ClientOnlyPortal";

export default function FooterPopUp({ value, className }) {
  return (
    <>
      <style jsx>{`
        body {
          overflow: hidden;
        }
        .wrapper {
          width: 100vw;
          padding: 1rem;
          position: absolute;
          bottom: 0;
          left: 0;
          background: var(--darkGrey);
          color: white;
          animation: moveIn 5s ease-in-out forwards;
        }

        @keyframes moveIn {
          0% {
            translate: 0 100%;
          }
          5% {
            translate: 0;
          }
          95% {
            translate: 0;
          }
          100% {
            translate: 0 100%;
          }
        }
      `}</style>
      <style global jsx>{`
        html,
        body {
          overflow-y: hidden;
        }
      `}</style>
      <ClientOnlyPortal selector="#usersModal">
        <div className={`wrapper ${className ? className : ""}`}>{value}</div>
      </ClientOnlyPortal>
    </>
  );
}
