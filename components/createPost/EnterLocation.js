import { useRef } from "react";

import PopUp from "../PopUp";
import styles from "./enterLocation.module.css";

export default function EnterLocation({ close }) {
  const mapRef = useRef(null);

  return (
    <PopUp
      title="Enter Location"
      close={() => close(mapRef.current.contentWindow.getPositionString())}
      className={styles.modalWrapper}
    >
      <div className={styles.mapWrapper}>
        <iframe
          src="/iframe/LeafletMap.html"
          height="100%"
          width="100%"
          ref={mapRef}
          frameBorder="0"
        />
      </div>
    </PopUp>
  );
}
