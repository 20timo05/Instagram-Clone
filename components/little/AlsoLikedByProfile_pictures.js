import ProfileImage from "./ProfileImage";

export default function AlsoLikedByProfile_pictures({ users }) {
  return (
    <>
      <style jsx>{`
        .wrapper {
          display: flex;
          position: relative;
          height: 25px;
          margin-right: 10px;
        }
        .iconWrapper {
          height: 25px;
          width: 25px;
          position: absolute;
          border: 2px solid var(--darkWhite);
          border-radius: 1000px;
          overflow: hidden;
        }
      `}</style>
      <div
        className="wrapper"
        style={{ width: `${users.length * 15 + 10}px` }}
      >
        {users.map((user, idx) => (
          <div
            key={user.id}
            className="iconWrapper"
            style={{ left: `${15 * idx}px` }}
          >
            <ProfileImage
              username={user.username}
              height="25"
              width="25"
            />
          </div>
        ))}
      </div>
    </>
  );
}
