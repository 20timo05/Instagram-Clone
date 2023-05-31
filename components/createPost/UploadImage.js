import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import Button from "../little/Button";
import styles from "./uploadImage.module.css";

export default function UploadImage({ setImgObj }) {
  const inputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    function dropHandler(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      uploadHandler([...evt.dataTransfer.files]);
    }

    function uploadHandler(files) {
      const filesRead = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          filesRead.push({ id: file.name, image_url: event.target.result });
          if (filesRead.length === files.length) setImgObj(filesRead);
        };
      });
    }

    window.addEventListener("dragover", (evt) => evt.preventDefault());
    window.addEventListener("dragenter", () => setDragOver(true));
    document.addEventListener("dragleave", (evt) => {
      if (evt.relatedTarget === null) setDragOver(false);
    });
    window.addEventListener("drop", dropHandler);

    inputRef.current.addEventListener("change", (evt) =>
      uploadHandler([...evt.target.files])
    );

    return () => {
      window.removeEventListener("dragover", (evt) => evt.preventDefault());
      window.removeEventListener("dragenter", () => setDragOver(true));
      window.removeEventListener("dragleave", () => setDragOver(false));
      window.removeEventListener("drop", dropHandler);

      inputRef?.current?.removeEventListener("change", (evt) =>
        uploadHandler([...evt.target.files])
      );
    };
  }, []);

  return (
    <section
      className={`${dragOver && styles.dragOver} ${styles.section}`}
      ref={dropZoneRef}
    >
      <Image
        src="/iconsStraightFromInstagram/CreatePostIcon.svg"
        alt=""
        fill
        draggable={false}
      />
      <h3>Ziehe Fotos und Videos hierher</h3>
      <input
        type="file"
        accept="image/png, image/jpeg"
        id="fileUpload"
        ref={inputRef}
        multiple={true}
      />
      <Button
        value="Vom Computer auswählen"
        onClick={() => inputRef.current.click()}
      />
    </section>
  );
}
