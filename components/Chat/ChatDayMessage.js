import formatTimeAgo from "../../lib/formatTime";

export default function ChatDayMessage({ timestamp }) {
  const formattedTime = formatTimeAgo(new Date(timestamp));
  return (
    <>
      <style jsx>{`
        span {
          color: var(--grey);
          width: 100%;
          padding: 1rem;
          text-align: center;
        }
      `}</style>
      <span>{formattedTime}</span>
    </>
  );
}
