import Link from "next/link";

import styles from "./postHeader.module.css";
import Popup from "../PopUp";

export default function MenuOptionsPopup({
  setMenuOpen,
  deletePostHandler,
  toggleLikesCommentHandler,
  currentLoggedInUser,
  username,
  copyLinkHandler,
  shareHandler,
  allowComments,
  allowLikes,
}) {
  return (
    <Popup
      title="Optionen"
      close={() => setMenuOpen(false)}
      className={styles.optionsWrapper}
      closeOnClick={true}
    >
      {currentLoggedInUser === username && (
        <div className={styles.red} onClick={deletePostHandler}>
          <Link href={`/${currentLoggedInUser}`}>Beitrag löschen</Link>
        </div>
      )}
      {currentLoggedInUser === username && (
        <div onClick={() => toggleLikesCommentHandler("likes")}>
          „Gefällt mir“-Angaben {allowLikes ? "deaktivieren" : "aktivieren"}
        </div>
      )}
      {currentLoggedInUser === username && (
        <div onClick={() => toggleLikesCommentHandler("comments")}>
          Kommentieren {allowComments ? "deaktivieren" : "aktivieren"}
        </div>
      )}
      <div onClick={copyLinkHandler}>Link kopieren</div>
      <div onClick={shareHandler}>Teilen</div>
    </Popup>
  );
}
