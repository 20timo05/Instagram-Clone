export default function Heart(props) {
  const { isLiked, setLiked, className, onClick } = props;

  return (
    <>
      <style jsx>{`
        .wrapper {
          cursor: pointer;
        }

        .heart:hover {
          opacity: 0.5;
        }

        .filledHeart {
          color: red;
          animation: 0.2s mount;
        }

        @keyframes mount {
          80% {
            scale: 1.2;
          }
        }
      `}</style>
      <span
        className={`wrapper ${className}`}
        onClick={() => {
          setLiked(!isLiked);
        }}
      >
        {isLiked ? (
          <i className="fa-solid fa-heart filledHeart"></i>
        ) : (
          <i className="fa-regular fa-heart heart"></i>
        )}
      </span>
    </>
  );
}
