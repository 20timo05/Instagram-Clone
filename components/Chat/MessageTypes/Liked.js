import { useState } from "react";

import PopUp from "../../PopUp";
import ShowUserListItem from "../../little/ShowUserListItem";

export default function Liked({ users, style, currentLoggedInUser }) {
  const [showUsers, setShowUsers] = useState(false);
  return (
    <>
      <style jsx>{`
        .heartCounter {
          padding: 5px;
          border: 1px solid var(--lightGrey);
          outline: 2px solid var(--darkWhite);
          border-radius: 10000px;
          cursor: pointer;
          background: var(--darkWhite);
          position: absolute;
          bottom: 0;
          right: 0;
          translate: -50% 75%;
        }
      `}</style>
      <span
        className="heartCounter"
        style={style}
        onClick={() => setShowUsers(true)}
      >
        ❤️ {users.length}
      </span>

      {showUsers && (
        <PopUp close={() => setShowUsers(false)} title={"Reaktionen"}>
          {users.map((user) => (
            <ShowUserListItem
              key={user.id}
              id={user.id}
              username={user.username}
              currentLoggedInUser={currentLoggedInUser}
            />
          ))}
        </PopUp>
      )}
    </>
  );
}
