import Popup from "../PopUp";
import SearchBar from "../Header/Searchbar";

import useWindowSize from "../../hooks/useWindowSize";

// use for tagging people on a post in creation process & when sending a post to another user
// => reuse searchbar component
export default function PeopleSelector({
  title,
  close,
  currentLoggedInUser,
  selectPeopleHandler,
}) {
  const { width } = useWindowSize();

  return (
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
        onSelect={selectPeopleHandler}
      />
    </Popup>
  );
}
