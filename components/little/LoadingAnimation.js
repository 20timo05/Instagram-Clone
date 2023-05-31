export default function loadingAnimation() {
  return (
    <>
      <style jsx>{`
        .wrapper {
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .wrapper > svg {
          height: 20px;
          width: 20px;
          animation: spin 0.8s steps(8) infinite;
        }

        @keyframes spin {
          from {
            rotate: 180deg;
          }
          to {
            rotate: 540deg;
          }
        }
      `}</style>
      <div className="wrapper">
        <svg aria-label="Wird geladen ..." viewBox="0 0 100 100">
          <rect
            fill="#555555"
            height="10"
            opacity="0"
            rx="5"
            ry="5"
            transform="rotate(-90 50 50)"
            width="28"
            x="67"
            y="45"
          ></rect>
          <rect
            fill="#555555"
            height="10"
            opacity="0.125"
            rx="5"
            ry="5"
            transform="rotate(-45 50 50)"
            width="28"
            x="67"
            y="45"
          ></rect>
          <rect
            fill="#555555"
            height="10"
            opacity="0.25"
            rx="5"
            ry="5"
            transform="rotate(0 50 50)"
            width="28"
            x="67"
            y="45"
          ></rect>
          <rect
            fill="#555555"
            height="10"
            opacity="0.375"
            rx="5"
            ry="5"
            transform="rotate(45 50 50)"
            width="28"
            x="67"
            y="45"
          ></rect>
          <rect
            fill="#555555"
            height="10"
            opacity="0.5"
            rx="5"
            ry="5"
            transform="rotate(90 50 50)"
            width="28"
            x="67"
            y="45"
          ></rect>
          <rect
            fill="#555555"
            height="10"
            opacity="0.625"
            rx="5"
            ry="5"
            transform="rotate(135 50 50)"
            width="28"
            x="67"
            y="45"
          ></rect>
          <rect
            fill="#555555"
            height="10"
            opacity="0.75"
            rx="5"
            ry="5"
            transform="rotate(180 50 50)"
            width="28"
            x="67"
            y="45"
          ></rect>
          <rect
            fill="#555555"
            height="10"
            opacity="0.875"
            rx="5"
            ry="5"
            transform="rotate(225 50 50)"
            width="28"
            x="67"
            y="45"
          ></rect>
        </svg>
      </div>
    </>
  );
}
