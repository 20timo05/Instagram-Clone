import { useEffect, useState, useRef } from "react";

import styles from "./searchbar.module.css";
import Input from "../auth/Input/index";
import LoadingAnimation from "../little/LoadingAnimation";
import OptionsSlider from "../little/OptionsSlider";
import ProfileImage from "../little/ProfileImage";

import useLooseFocus from "../../hooks/useLooseFocus";
import useFetch, { fetchData } from "../../hooks/useFetch";
import useDebounce from "../../hooks/useDebounce";
import useLazyLoad from "../../hooks/useLazyLoad";
import useSelectOptionsWithKeys from "../../hooks/useSelectOptionsWithKeys";

export default function Searchbar(props) {
  const optionsSlideroptions = getOptionsSliderOptions(props);

  const [searchVal, setSearchVal] = useState("");
  const [searchType, setSearchType] = useState(optionsSlideroptions[0].name);

  const inputRef = useRef(null);
  const searchOptionsRef = useRef(null);
  const [searchInputFocus, setSearchInputFocus] = useLooseFocus(
    [inputRef],
    [searchOptionsRef]
  );

  // prevent clicking in inputRef from TOGGLING focus
  const [focusInput, setFocusInput] = useState(false);

  const [lastSearchesLoading, lastSearches, deleteOption, addOption] =
    useLastSearches(props.currentLoggedInUser.id);
  const [searchOptionsLoading, searchOptions, loadMore] = useSearch(
    props.currentLoggedInUser.id,
    searchVal,
    searchType
  );

  // go through the options with UP & and DOWN Arrow
  const [currentOptionIdx, resetCurrentOptionIdx] = useSelectOptionsWithKeys(
    searchVal.length === 0 ? lastSearches?.length : searchOptions.length,
    (idx) => {
      if (searchVal.length === 0)
        clickOnOption(lastSearches[idx], lastSearches[idx].username, "user");
      else {
        if (searchOptions[idx].id) {
          clickOnOption(
            searchOptions[idx],
            searchOptions[idx].username,
            "user"
          );
        } else {
          clickOnOption(
            searchOptions[idx],
            searchOptions[idx].tag_name,
            "hashtag"
          );
        }
      }
    }
  );
  // scroll focused option (from UP/DOWN arrow) into view if needed
  useEffect(() => {
    if (!searchOptionsRef.current) return;
    const currentSearchOption =
      searchOptionsRef.current.children[1].children[currentOptionIdx];

    const topDifference =
      currentSearchOption.getBoundingClientRect().top -
      searchOptionsRef.current.getBoundingClientRect().top;
    if (
      topDifference >= searchOptionsRef.current.getBoundingClientRect().height
    ) {
      currentSearchOption.scrollIntoView(false);
    } else if (topDifference < 0) {
      currentSearchOption.scrollIntoView(true);
    }
  }, [currentOptionIdx]);

  // if the second last option which is loaded is visible to the user
  // => already lazy load the next 10 searchOptions
  const wrapper = searchOptionsRef?.current?.children[1];
  const [secondLastOption, setSecondLastOption] = useState(null);
  useEffect(() => {
    setSecondLastOption(wrapper?.children[wrapper?.children.length - 2]);
  }, [searchOptionsRef, searchOptions]);

  useLazyLoad(secondLastOption, () => {
    if (wrapper.children.length % 10 === 0) {
      loadMore();
    }
  });

  const deleteAllHandler = () => {
    lastSearches.forEach((lastSearch) => deleteOption(lastSearch.id));
  };

  const clickOnOption = (option, value, type) => {
    props.onSelect?.(value, type, option);
    if (type === "user") addOption(option);
    setSearchInputFocus(false);
    setSearchVal("");
  };

  return (
    <form
      className={styles.searchbarWrapper}
      onSubmit={(evt) => {
        evt.preventDefault();
        console.log(searchType);
        let simplefiedSearchType = searchType;
        if (["onlyFollowers", "mostPopular"].includes(searchType))
          simplefiedSearchType = "user";

        props.onSelect?.(searchVal, simplefiedSearchType);
        setSearchInputFocus(false);
        setSearchVal("");
      }}
    >
      <Input
        placeholder="Suchen"
        value={searchVal}
        change={setSearchVal}
        customRef={inputRef}
        onClick={() => setSearchInputFocus(false)}
        onFocus={() => setFocusInput(true)}
        onBlur={() => setFocusInput(false)}
      />
      {(searchInputFocus || focusInput) && (
        <section className={styles.searchOptionsWrapper} ref={searchOptionsRef}>
          {searchVal.length === 0 ? (
            lastSearches?.length > 0 && (
              <>
                <header className={styles.lastSearchesHeader}>
                  <span>Letzte Suchanfragen</span>
                  <span onClick={deleteAllHandler}>Alle löschen</span>
                </header>
                <section>
                  {!lastSearchesLoading ? (
                    lastSearches.map((option, idx) => (
                      <UserSearchOption
                        key={option.id}
                        option={option}
                        onDelete={() => deleteOption(option.id)}
                        onClick={() =>
                          clickOnOption(option, option.username, "user")
                        }
                        focused={idx === currentOptionIdx}
                      />
                    ))
                  ) : (
                    <LoadingAnimation />
                  )}
                </section>
              </>
            )
          ) : (
            <>
              <OptionsSlider
                options={optionsSlideroptions.map((opt) => opt.icon)}
                onClick={([, idx]) =>
                  setSearchType(optionsSlideroptions[idx].name)
                }
              />
              <section>
                {searchOptions.length > 0 &&
                  searchOptions.map((option, idx) =>
                    option.tag_name ? (
                      <HashTagOrLocationSearchOption
                        key={option.tag_name}
                        type="hashtag"
                        name={option.tag_name}
                        quantity={option.quantity}
                        onClick={() =>
                          clickOnOption(option, option.tag_name, "hashtag")
                        }
                        focused={idx === currentOptionIdx}
                      />
                    ) : option.lat ? (
                      <HashTagOrLocationSearchOption
                        key={option.id}
                        type="location"
                        name={option.name}
                        {...option}
                        onClick={() =>
                          clickOnOption(option, option.name, "location")
                        }
                        focused={idx === currentOptionIdx}
                      />
                    ) : (
                      <UserSearchOption
                        key={option.id}
                        option={option}
                        onClick={() =>
                          clickOnOption(option, option.username, "user")
                        }
                        focused={idx === currentOptionIdx}
                      />
                    )
                  )}
                {searchOptionsLoading && <LoadingAnimation />}
                {searchOptions.length === 0 && !searchOptionsLoading && (
                  <div className={styles.noResultsFoundLabel}>
                    Keine Ergebnisse gefunden.
                  </div>
                )}
              </section>
            </>
          )}
        </section>
      )}
    </form>
  );
}

function useLastSearches(currentLoggedInUserId) {
  const [lastSearches, setLastSearches, loading] = useFetch(
    "GET",
    `/api/search/getLastSearches/${currentLoggedInUserId}`,
    null,
    null,
    null,
    { cache: "no-store" }
  );

  async function deleteOptionHandler(id) {
    console.log(id);
    const { ok, data, error } = await fetchData(
      "DELETE",
      `/api/search/setLastSearch/`,
      { searched_user_id: id }
    );
    console.log(ok ? data : error);
    setLastSearches((prev) => prev.filter((option) => option.id !== id));
  }

  async function addOptionHandler(option) {
    // add to last search
    const { ok, data, error } = await fetchData(
      "POST",
      `/api/search/setLastSearch/`,
      { searched_user_id: option.id }
    );
    console.log(ok ? data : error);

    setLastSearches((prev) => [
      option,
      ...prev.filter((prevOptions) => prevOptions.id !== option.id),
    ]);
  }

  return [loading, lastSearches, deleteOptionHandler, addOptionHandler];
}

function useSearch(currentLoggedInUserId, searchVal, searchType) {
  const debouncedSearchVal = useDebounce(searchVal, 500);

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lazyLoadIteration, setLazyLoadIteration] = useState(0);

  async function fetchDataHandler(lazyLoadIteration) {
    let route = "getUsers";
    if (searchType === "hashtags") route = "getHashtags";
    else if (searchType === "location") route = "getLocations";

    // create url search params object (different for getUsers)
    let params;
    if (route === "getUsers") {
      params = {
        userId: currentLoggedInUserId,
        searchVal,
        type: searchType,
        lazyLoadIteration,
      };
    } else {
      params = {
        searchVal,
        lazyLoadIteration,
      };
    }

    const { data } = await fetchData("GET", `/api/search/${route}`, params);

    setOptions((prev) => [...prev, ...data]);
    setLoading(false);
  }
  // fetch completly new search options when searchbar value or type changes
  useEffect(() => {
    setOptions([]);
    setLazyLoadIteration(0);
    if (searchVal.length > 0) {
      setLoading(true);
      fetchDataHandler(lazyLoadIteration);
    }
  }, [debouncedSearchVal, searchType]);

  // only fetch additional search options when lazyLoadIteration changes
  useEffect(() => {
    if (searchVal.length > 0) {
      setLoading(true);
      fetchDataHandler(lazyLoadIteration);
    }
  }, [lazyLoadIteration]);

  const loadMore = () => setLazyLoadIteration((prev) => prev + 1);

  return [loading, options, loadMore];
}

export function UserSearchOption({ option, onDelete, onClick, focused }) {
  return (
    <div
      className={`${styles.searchOptions} ${focused && styles.focused}`}
      onClick={(evt) => evt.target.tagName !== "I" && onClick()}
    >
      <ProfileImage username={option.username} height="44" width="44" />
      <div>
        <span>{option.username}</span>
        <span>{option.full_name}</span>
      </div>
      {onDelete && <i className="fa-solid fa-xmark" onClick={onDelete}></i>}
    </div>
  );
}

function HashTagOrLocationSearchOption({
  type,
  name,
  quantity,
  lat,
  lng,
  onClick,
  focused,
}) {
  const formatter = Intl.NumberFormat("de", { notation: "compact" });
  return (
    <div
      className={`${styles.searchOptions} ${focused && styles.focused}`}
      onClick={onClick}
    >
      <div>
        {type === "hashtag" && <i className="fa-solid fa-hashtag"></i>}
        {type === "location" && <i className="fa-solid fa-location-dot"></i>}
      </div>
      <div>
        <span>
          {type === "hashtag" && "#"}
          {name}
        </span>
        <span>
          {formatter.format(quantity)} {quantity === 1 ? "Beitrag" : "Beiträge"}
        </span>
      </div>
    </div>
  );
}

// create array with all icons and their names based on the props of the component for the options slider
function getOptionsSliderOptions(props) {
  const optionsSlideroptions = [];
  if (props.onlyFollowers)
    optionsSlideroptions.push({
      icon: <i className="fa-solid fa-user-group"></i>,
      name: "onlyFollowers",
    });
  if (props.mostPopular)
    optionsSlideroptions.push({
      icon: <i className="fa-solid fa-user"></i>,
      name: "mostPopular",
    });
  if (props.hashtags)
    optionsSlideroptions.push({
      icon: <i className="fa-solid fa-hashtag"></i>,
      name: "hashtags",
    });
  if (props.location)
    optionsSlideroptions.push({
      icon: <i className="fa-solid fa-location-dot"></i>,
      name: "location",
    });
  return optionsSlideroptions;
}
