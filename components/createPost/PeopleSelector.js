import { useState } from "react";
import { useRouter } from "next/router";

import Popup from "../PopUp";
import SearchBar from "../Header/Searchbar";
import { UserSearchOption } from "../Header/Searchbar";
import Button from "../little/Button";

import useWindowSize from "../../hooks/useWindowSize";

// use for tagging people on a post in creation process & when sending a post to another user
// => reuse searchbar component
export default function PeopleSelector({
  title,
  close,
  currentLoggedInUser,
  selectPeopleHandler,
  multiple,
}) {
  const [peopleList, setPeopleList] = useState([]);
  const router = useRouter();

  const { width } = useWindowSize();

  return (
    <>
      <style jsx>
        {`
          .peopleListWrapper {
            height: calc(487px - 3em);
            overflow-y: auto;
          }
        `}
      </style>
      <Popup
        title={title}
        close={close}
        style={{
          transform: `scale(${Math.min((width * 0.9) / 446, 1)})`,
          margin: `${(-650 + 650 * Math.min((width * 0.9) / 446, 1)) / 2}px`,
          height: "565px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <SearchBar
          currentLoggedInUser={currentLoggedInUser}
          onlyFollowers={true}
          mostPopular={true}
          onSelect={(...item) => {
            if (!multiple) return selectPeopleHandler(item);
            setPeopleList((prev) => {
              if (prev.find((person) => person.id === item[2].id)) return prev;
              return [item[2], ...prev];
            });
          }}
        />

        {multiple && (
          <div className="peopleListWrapper">
            {peopleList.map((option) => (
              <UserSearchOption
                key={option.id}
                option={option}
                onDelete={() =>
                  setPeopleList((prev) =>
                    prev.filter(({ id }) => id !== option.id)
                  )
                }
                onClick={() => router.push(`/${option.username}`)}
              />
            ))}
            <Button
              value="Senden"
              disabled={peopleList.length === 0}
              style={{
                position: "absolute",
                bottom: "1rem",
                left: "50%",
                translate: "-50%",
                width: "fit-content"
              }}
              onClick={() => selectPeopleHandler(peopleList)}
            />
          </div>
        )}
      </Popup>
    </>
  );
}
