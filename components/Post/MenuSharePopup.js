import styles from "./postHeader.module.css";
import Popup from "../PopUp";

export default function MenuSharePopup({
  setShareMenuOpen,
  shareUrl,
  shareText,
  copyLinkHandler,
  setQRCodeMenuOpen
}) {
  return (
    <Popup
      title="Teilen"
      close={() => setShareMenuOpen(false)}
      className={`${styles.optionsWrapper} ${styles.shareWrapper}`}
      closeOnClick={true}
    >
      <div>
        <i className="fa-regular fa-paper-plane"></i>
        Über Direct teilen
      </div>
      <div>
        <i className="fa-brands fa-facebook"></i>
        <a
          href={`https://www.facebook.com/share.php?u=${shareUrl}/`}
          target="_blank"
        >
          Auf Facebook teilen
        </a>
      </div>
      <div>
        <i className="fa-brands fa-twitter"></i>
        <a
          href={`http://twitter.com/share?&url=${shareUrl}&text=${shareText}:`}
          target="_blank"
        >
          Auf Twitter teilen
        </a>
      </div>
      <div>
        <i className="fa-regular fa-envelope"></i>
        <a
          href={`mailto:?subject=${shareText}&body=${shareText}: ${shareUrl}`}
          target="_top"
        >
          Per E-Mail teilen
        </a>
      </div>
      <div onClick={() => setQRCodeMenuOpen(true)}>
        <i className="fa-solid fa-qrcode"></i>
        QR-Code
      </div>
      <div onClick={copyLinkHandler}>
        <i className="fa-solid fa-link"></i>
        Link kopieren
      </div>
    </Popup>
  );
}
