import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";

import SearchBar from "./Searchbar";
import styles from "./style.module.css";

import useWindowSize from "../../hooks/useWindowSize";
import ProfileImage from "../little/ProfileImage";

export default function Header(props) {
  const { currentLoggedInUser, active } = props;
  const showSearchbar = useWindowSize().width > 550;

  const router = useRouter();
  const searchbarSelectHandler = async (searchVal, type) => {
    if (type === "user") {
      router.push(`/${searchVal}`);
    } else if (type === "hashtag") {
      router.push(
        `/explore/${searchVal}?${new URLSearchParams({ type: "tag" })}`
      );
    } else if (type === "location") {
      router.push(
        `/explore/${searchVal}?${new URLSearchParams({ type: "location" })}`
      );
    }
  };

  return (
    <header className={styles.header}>
      <Link href="/" style={{ cursor: "pointer" }}>
        <Image
          src="/logo.png"
          alt="Logo"
          height={180 * 0.2}
          width={180 * 0.2}
        />
        <div className={styles.verticalLine}></div>
        <div className={styles.logoLabel}>Instagram</div>
      </Link>

      {showSearchbar && (
        <SearchBar
          currentLoggedInUser={currentLoggedInUser}
          onlyFollowers={true}
          mostPopular={true}
          hashtags={true}
          location={true}
          onSelect={searchbarSelectHandler}
        />
      )}

      <aside className={styles.buttons}>
        <Link href="/">
          <svg
            aria-label="Startseite"
            height="24"
            role="img"
            viewBox="0 0 24 24"
            width="24"
          >
            <path
              d="M9.005 16.545a2.997 2.997 0 012.997-2.997h0A2.997 2.997 0 0115 16.545V22h7V11.543L12 2 2 11.543V22h7.005z\"
              fill={active == "home" ? "" : "none"}
              stroke="currentColor"
              strokeLinejoin="round"
              strokeWidth="2.5"
            ></path>
          </svg>
        </Link>
        <Link href="/inbox">
          {active === "inbox" ? (
            <i className="fa-solid fa-paper-plane"></i>
          ) : (
            <i className="fa-regular fa-paper-plane"></i>
          )}
        </Link>
        <Link href={`/createPost`}>
          {active === "create" ? (
            <i className="fa-solid fa-square-plus"></i>
          ) : (
            <i className="fa-regular fa-square-plus"></i>
          )}
        </Link>
        <Link href="/recommendations">
          {active === "recommendations" ? (
            <i className="fa-solid fa-heart"></i>
          ) : (
            <i className="fa-regular fa-heart"></i>
          )}
        </Link>
        <Link href={`/${currentLoggedInUser.username}`}>
          <div>
            <ProfileImage
              username={currentLoggedInUser.username}
              height="35"
              width="35"
              {...(active === "profile" && {
                style: { border: "2px solid black" },
              })}
            />
          </div>
        </Link>
      </aside>
    </header>
  );
}
