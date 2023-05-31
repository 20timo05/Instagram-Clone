import { useRef } from "react";
import { QRCode } from "react-qrcode-logo";

import styles from "./postHeader.module.css";
import Popup from "../PopUp";

// https://www.npmjs.com/package/react-qrcode-logo

export default function MenuQRCodePopup({
  setQRCodeMenuOpen,
  shareUrl,
  username,
}) {
  const qrCodeRef = useRef(null);

  const downloadHandler = () => {
    const canvas = qrCodeRef.current.canvas.current;
    const img = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = img;

    const date = new Date()
      .toDateString()
      .slice(4)
      .replaceAll(" ", ", ")
      .replace(",", ".");
    a.download = `Beitrag geteilt am ${date}_qr.png`;

    a.click();
  };

  return (
    <Popup
      title="QR-Code"
      close={() => setQRCodeMenuOpen(false)}
      className={`${styles.optionsWrapper} ${styles.qrCodeWrapper}`}
    >
      <QRCode
        value={shareUrl}
        ecLevel="H"
        size={150}
        logoImage={"/logo.png"}
        removeQrCodeBehindLogo={true}
        qrStyle="dots"
        eyeRadius={5}
        ref={qrCodeRef}
      />
      <p>
        Personen können deinen QR-Code mit ihrem Smartphone scannen, um sich
        diesen Beitrag anzusehen.
      </p>
      <div
        onClick={downloadHandler}
        style={{
          color: "var(--blue)",
          borderTop: "1px solid var(--lightGrey)",
        }}
      >
        QR-Code herunterladen
      </div>
      <div onClick={() => setQRCodeMenuOpen(false)}>Fertig</div>
    </Popup>
  );
}
