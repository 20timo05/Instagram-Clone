import Liked from "./Liked";

export default function TextMessage({
  value,
  ownMessage,
  onLike,
  likes,
  currentLoggedInUser,
}) {
  const clickHandler = (evt) => {
    if (evt.detail === 2) onLike();
  };
  
  return (
    <>
      <style jsx>{`
        div {
          position: relative;
          width: fit-content;
          min-width: 3rem;
          text-align: center;
          max-width: 75%;
          padding: 1rem;
          border: 1px solid var(--lightGrey);
          border-radius: 100px;
          font-size: 0.9rem;
        }

        div.right {
          background: var(--lightGrey);
        }

        div.liked {
          margin-bottom: 1rem;
        }
      `}</style>
      <div className={`${ownMessage && "right"} ${likes?.length > 0 && "liked"}`} onClick={clickHandler}>
        {value}
        {likes?.length > 0 && (
          <Liked users={likes} currentLoggedInUser={currentLoggedInUser} />
        )}
      </div>
    </>
  );
}
