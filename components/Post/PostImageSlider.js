import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import PeopleTag from "./PeopleTag";

import styles from "./postImageSlider.module.css";
import useWindowSize from "../../hooks/useWindowSize";
import createInnerShadow from "../../lib/vignetteEffectCanvas";

export default function PostImageSlider(props) {
  const {
    photos,
    onTop,
    notAlone,
    setOnTop,
    getCurrentPhotoIdx,
    style = {},
    props: imgProps = {}
  } = props;

  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);
  const [showPeopleTags, setShowPeopleTags] = useState(false);

  const photoSliderRef = useRef(null);

  useEffect(() => {
    if (getCurrentPhotoIdx) getCurrentPhotoIdx(currentPhotoIdx);
  }, [currentPhotoIdx, setCurrentPhotoIdx]);

  // responsive
  const [scale, setScale] = useState(1);
  const [onTopScale, setOnTopScale] = useState(1);
  const { height, width } = useWindowSize();

  useEffect(() => {
    if (!height || !width) return;

    const newScale = Math.min((width * 0.8 - 510) / 650, 1);
    setScale(newScale);
    
    if (props.setOnTop) setOnTop(newScale * width < 350);
    if (notAlone || onTop || newScale * width < 300) {
      setOnTopScale(Math.min(window.innerWidth / 650, 1));
    }
  }, [height, width]);

  useEffect(() => {
    photos.forEach((photo, idx) => {
      const img = photoSliderRef.current.childNodes[idx].children[0];

      if (photo.scale) img.style.scale = `${photo.scale}`;

      if (photo.offsetX !== 0 || photo.offsetY !== 0)
        img.style.translate = `${photo.offsetX}px ${photo.offsetY}px`;

      let filter = "";
      if (photo.brightness !== 1) filter += `brightness(${photo.brightness})`;
      if (photo.contrast !== 1) filter += `contrast(${photo.contrast})`;
      if (photo.sepia) filter += `sepia(${photo.sepia})`;
      img.style.filter = filter;
      if (photo.blur) img.parentElement.style.filter = `blur(${photo.blur}px)`;

      if (photo.vignette) {
        const canvas = document.createElement("canvas");
        // create new image based on the image_url (do not use just the img from above) because we do not want to apply the filter on to an already changed image
        const image = new Image();
        image.src = photo.image_url;
        image.onload = () => {
          createInnerShadow(canvas, image, photo.vignette, 1);
          img.src = canvas.toDataURL();
        };
      }
    });
  }, [photos]);

  return (
    <div
      className={`${styles.photoSliderWrapper} ${
        notAlone || onTop ? styles.onTop : ""
      }`}
      style={
        !notAlone && !onTop
          ? {
              transform: `scale(${scale})`,
              marginLeft: `${(-650 + 650 * scale) / 2}px`,
            }
          : {
              transform: `scale(${onTopScale})`,
              marginLeft: `${(-650 + 650 * onTopScale) / 2}px`,
              marginTop: `${(-650 + 650 * onTopScale - 7) / 2}px`,
              marginBottom: `${(-650 + 650 * onTopScale - 7) / 2}px`,
            }
      }
      onClick={() => setShowPeopleTags((prev) => !prev)}
    >
      <section className={styles.photoSlider} ref={photoSliderRef}>
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            className={styles.photoWrapper}
            style={{ left: `${(idx - currentPhotoIdx) * 650}px` }}
          >
            <Image
              src={photo.image_url}
              alt={photo.alternativeText || "Post photo"}
              fill
              sizes={"(min-width: 650px) 650px, 100vw"}
              style={{ objectFit: photo.scale ? "contain" : "cover", ...style }}
              {...imgProps}
            />
          </div>
        ))}
      </section>

      {photos.length > 1 && (
        <>
          {/* dots displaying which photo is currently shown  */}
          <div className={styles.dots}>
            {photos.map((photo, idx) => (
              <div
                key={photo.id}
                className={`${
                  currentPhotoIdx === photo.position ? styles.active : ""
                }`}
                onClick={() => setCurrentPhotoIdx(idx)}
              ></div>
            ))}
          </div>
          {/* controls to switch between photos */}
          <div className={styles.controls}>
            <i
              className="fa-solid fa-chevron-left"
              onClick={() => setCurrentPhotoIdx((prev) => prev - 1)}
              style={{ transform: `scale(${currentPhotoIdx > 0 ? 1 : 0})` }}
            ></i>
            <i
              className="fa-solid fa-chevron-right"
              onClick={() => setCurrentPhotoIdx((prev) => prev + 1)}
              style={{
                transform: `scale(${
                  currentPhotoIdx < photos.length - 1 ? 1 : 0
                }`,
              }}
            ></i>
          </div>
        </>
      )}
      {showPeopleTags &&
        photos[currentPhotoIdx]?.peopleTags?.map((person) => (
          <PeopleTag
            key={person.username + person.photo_id}
            username={person.username}
            x={person.posX}
            y={person.posY}
          />
        ))}
    </div>
  );
}
