import Link from "next/link";

import useToggleFollow from "../../hooks/useToggleFollow";
import ProfileImage from "./ProfileImage";

export default function ShowUserListItem({
  id,
  currentLoggedInUser,
  username,
}) {
  const [followStatus, toggleFollow] = useToggleFollow(
    id,
    currentLoggedInUser.username
  );

  return (
    <>
      <style jsx>{`
        .wrapper {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          font-size: 1.2rem;
          cursor: pointer;
          border-radius: 5px;
          transition: 0.2s ease-in-out;
        }

        .wrapper:hover {
          background: var(--lighterGrey);
        }

        .profilePictureWrapper {
          height: 60px;
          width: 60px;
          border-radius: 100px;
          overflow: hidden;
        }

        .wrapper > span {
          margin: 0 1rem;
        }

        .followButton {
          background: var(--blue);
          border: none;
          border-radius: 5px;
          color: white;
          font-weight: bolder;
          padding: 0.5rem 1rem;
          margin-left: auto;
          cursor: pointer;
        }

        .followButton.follow {
          background: white;
          border: 1px solid var(--lightGrey);
          color: black;
        }
      `}</style>
      <Link href={`/${username}`} style={{ width: "100%" }}>
        <div className="wrapper">
          <div className="profilePictureWrapper">
            <ProfileImage username={username} height="60" width="60" />
          </div>
          <span>{username}</span>
          {username !== currentLoggedInUser.username && (
            <button
              onClick={(evt) => {
                evt.preventDefault();
                toggleFollow();
              }}
              className={`followButton ${followStatus ? "follow" : ""}`}
            >
              {followStatus ? "Gefolgt" : "Folgen"}
            </button>
          )}
        </div>
      </Link>
    </>
  );
}
