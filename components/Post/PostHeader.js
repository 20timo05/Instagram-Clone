import { useState, useEffect } from "react";
import Link from "next/link";

import styles from "./postHeader.module.css";
import MenuOptionsPopup from "./MenuOptionsPopup";
import MenuSharePopup from "./MenuSharePopup";
import MenuQRCodePopup from "./MenuQRCodePopup";
import FooterPopUp from "../FooterPopUp";

import useToggleFollow from "../../hooks/useToggleFollow";
import copyTextToClipboard from "../../lib/copyTextToClipboard";
import useDelayUnmount from "../../hooks/useDelayUnmount";

import { fetchData } from "../../hooks/useFetch";
import ProfileImage from "../little/ProfileImage";

export default function PostHeader({
  id,
  username,
  onTop,
  notAlone = false,
  currentLoggedInUser,
  post_id,
  allowComments,
  allowLikes,
  location,
  lat,
  lng,
}) {
  const [followStatus, toggleFollow] = useToggleFollow(id, currentLoggedInUser);

  const [menuOpen, setMenuOpen] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [QRCodeMenuOpen, setQRCodeMenuOpen] = useState(false);

  const [showFooterPopup, setShowFooterPopup] = useState(false);
  const shouldRenderFooterPopup = useDelayUnmount(showFooterPopup, 250);

  const shareText = `Sieh dir diesen Instagram-Beitrag von @${username} an`;
  const [shareUrl, setShareUrl] = useState("");
  useEffect(() => {
    // @DEPLOY change back
    //setShareUrl(`${window.location.origin}/${username}/${post_id}`);
    setShareUrl(
      `http://timoscomputer:${window.location.port}/${username}/${post_id}`
    );
  }, []);

  const deletePostHandler = async () => {
    const { ok, data, error } = await fetchData(
      "DELETE",
      "/api/posts/deletePost",
      { postId: post_id }
    );
    console.log(ok ? data : error);
  };

  const toggleLikesCommentHandler = async (likeOrComment) => {
    const { ok, data, error } = await fetchData(
      "PATCH",
      "/api/posts/likeCommentAbilityToggle",
      {
        postId: post_id,
        ...(likeOrComment === "likes" && {
          allowLikes: !allowLikes,
          allowComments,
        }),
        ...(likeOrComment === "comments" && {
          allowLikes,
          allowComments: !allowComments,
        }),
      }
    );
    console.log(ok ? data : error);
  };

  const copyLinkHandler = () => {
    copyTextToClipboard(shareUrl);
    setShowFooterPopup(true);
    setTimeout(() => setShowFooterPopup(false), 5000);
  };

  const shareHandler = () => {
    if (navigator.share) {
      navigator
        .share({
          title: document.title,
          text: `${shareText}:`,
          url: shareUrl,
        })
        .then(() => console.log("Successful share! 🎉"))
        .catch((err) => console.error(err));
    } else {
      setShareMenuOpen(true);
    }
  };

  return (
    <>
      <header className={`${styles.header} ${onTop ? styles.onTop : ""}`}>
        <Link href={`/${username}`}>
          <ProfileImage username={username} height="40" width="40" />
        </Link>
        <Link href={`/${username}`}>
          <h4>{username}</h4>
        </Link>
        {!notAlone && username !== currentLoggedInUser && (
          <>
            <span className={styles.filler}>•</span>
            {followStatus !== null && (
              <span onClick={toggleFollow} className={styles.link}>
                {followStatus ? "Gefolgt" : "Folgen"}
              </span>
            )}
          </>
        )}
        {location && (
          <div className={styles.location}>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
            >
              <i className="fa-solid fa-location-dot"></i>
              <div>{location}</div>
            </a>
          </div>
        )}
        <i
          className="fa-solid fa-ellipsis"
          onClick={() => setMenuOpen(true)}
        ></i>
      </header>
      {menuOpen && (
        <MenuOptionsPopup
          setMenuOpen={setMenuOpen}
          deletePostHandler={deletePostHandler}
          toggleLikesCommentHandler={toggleLikesCommentHandler}
          currentLoggedInUser={currentLoggedInUser}
          username={username}
          copyLinkHandler={copyLinkHandler}
          shareHandler={shareHandler}
          allowLikes={allowLikes}
          allowComments={allowComments}
        />
      )}
      {shareMenuOpen && (
        <MenuSharePopup
          setShareMenuOpen={setShareMenuOpen}
          shareUrl={shareUrl}
          shareText={shareText}
          copyLinkHandler={copyLinkHandler}
          setQRCodeMenuOpen={setQRCodeMenuOpen}
        />
      )}

      {QRCodeMenuOpen && (
        <MenuQRCodePopup
          setQRCodeMenuOpen={setQRCodeMenuOpen}
          shareUrl={shareUrl}
          username={username}
        />
      )}

      {shouldRenderFooterPopup && (
        <FooterPopUp value="Link in Zwischenablage kopiert." />
      )}
    </>
  );
}
