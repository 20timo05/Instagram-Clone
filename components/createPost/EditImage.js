import { useState, useEffect, useRef } from "react";

import styles from "./editImage.module.css";

import PostImageSlider from "../Post/PostImageSlider";
import EditImageOption from "./EditImageOption";
import Button from "../little/Button";
import OptionsSlider from "../little/OptionsSlider";

import useWindowSize from "../../hooks/useWindowSize";
import convertImageEdit from "../../lib/convertImageEdit";

export default function EditImage(props) {
  const { imgObj, next, back } = props;

  const innerWrapperRef = useRef(null);
  const [editOption, setEditOption] = useState("scale");

  // scale
  const [currentIdx, setCurrentIdx] = useState(0);
  const [imgScaleSwitch, setImgScaleSwitch] = useState(imgObj.map(() => false));

  const [imgScale, setImgScale] = useState(imgObj.map(() => 1));
  const [imgOffset, setImgOffset] = useState(imgObj.map(() => [0, 0]));
  const [prevPointerOffset, setPrevPointerOffset] = useState(
    imgObj.map(() => [0, 0])
  );

  // anpassungen
  const [brightness, setBrightness] = useState(imgObj.map(() => 1));
  const [contrast, setContrast] = useState(imgObj.map(() => 1));
  const [warmth, setWarmth] = useState(imgObj.map(() => 0));
  const [blur, setBlur] = useState(imgObj.map(() => 0));
  const [vignette, setVignette] = useState(imgObj.map(() => 0));

  const imageSliderImgs = imgObj.map((img, idx) => ({
    ...img,
    peopleTags: [],
    position: idx,
    scale: imgScale[idx],
    offsetX: imgOffset[idx][0],
    offsetY: imgOffset[idx][1],
    brightness: brightness[idx],
    contrast: contrast[idx],
    sepia: warmth[idx],
    blur: blur[idx],
    vignette: vignette[idx],
  }));

  // responsive
  const [scale, setScale] = useState(1);
  const { height, width } = useWindowSize();

  useEffect(() => {
    if (!height || !width) return;

    const newScale = Math.min((width * 0.8) / 650, 1);
    setScale(newScale);
  }, [height, width]);

  // store startposition of drag
  useEffect(() => {
    const pointerDownPos = {
      x: undefined,
      y: undefined,
    };

    const getRelativePosition = (evt) => {
      const { clientX, clientY } = evt;
      const { top, left } = innerWrapperRef.current.getBoundingClientRect();
      return [clientX - left, clientY - top];
    };

    const pointerDownHandler = (evt) => {
      const [x, y] = getRelativePosition(evt);
      pointerDownPos.x = x;
      pointerDownPos.y = y;
    };
    innerWrapperRef.current.addEventListener("pointerdown", pointerDownHandler);
    const pointerUpHandler = (evt) => {
      if (!pointerDownPos.x) return;
      const [x, y] = getRelativePosition(evt);
      const { x: pointerDownX, y: pointerDownY } = pointerDownPos;
      setPrevPointerOffset((prev) => {
        const prevCopy = [...prev];
        prevCopy[currentIdx] = [
          prevCopy[currentIdx][0] + x - pointerDownX,
          prevCopy[currentIdx][1] + y - pointerDownY,
        ];
        return prevCopy;
      });

      pointerDownPos.x = undefined;
      pointerDownPos.y = undefined;
    };
    innerWrapperRef.current.addEventListener("pointerup", pointerUpHandler);
    const pointerMoveHandler = (evt) => {
      if (pointerDownPos.x === undefined) return;

      // set it to the same value, just get the actual current version of prevPointerOffset (available in callback)
      setPrevPointerOffset((prevPointerOffset) => {
        const [x, y] = getRelativePosition(evt);
        setImgOffset((prev) => {
          const prevCopy = [...prev];
          prevCopy[currentIdx] = [
            prevPointerOffset[currentIdx][0] + (x - pointerDownPos.x),
            prevPointerOffset[currentIdx][1] + (y - pointerDownPos.y),
          ];
          return prevCopy;
        });
        return prevPointerOffset;
      });
    };
    innerWrapperRef.current.addEventListener("pointermove", pointerMoveHandler);

    return () => {
      innerWrapperRef.current?.removeEventListener(
        "pointerdown",
        pointerDownHandler
      );
      innerWrapperRef.current?.removeEventListener(
        "pointerup",
        pointerUpHandler
      );
      innerWrapperRef.current?.removeEventListener(
        "pointermove",
        pointerMoveHandler
      );
    };
  }, [currentIdx]);

  async function scaleSwitchChangeHandler(checked) {
    setImgScaleSwitch((prev) => {
      const prevCopy = [...prev];
      prevCopy[currentIdx] = checked;
      return prevCopy;
    });
    if (!checked) return;

    const img = new Image();
    img.src = imgObj[0].image_url;
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const defaultScaleFactor = 650 / Math.max(img.height, img.width);
        const scaleFactor =
          650 / (Math.min(img.height, img.width) * defaultScaleFactor);
        setImgScale((prev) => {
          const prevCopy = [...prev];
          prevCopy[currentIdx] = scaleFactor;
          return prevCopy;
        });
        setImgOffset((prev) => {
          const prevCopy = [...prev];
          prevCopy[currentIdx] = [0, 0];
          return prevCopy;
        });
        resolve(Math.min((Math.sqrt(scaleFactor) - 0.5) * 100, 100));
      };

      img.onerror = reject;
    });
  }
  function sliderChangeHandler(sliderStateSetFunction, sliderValue) {
    const setValue = (prev) => {
      const prevCopy = [...prev];
      prevCopy[currentIdx] = Math.pow(sliderValue / 100 + 0.5, 2);
      return prevCopy;
    };
    if (sliderStateSetFunction === setImgScale) {
      setImgScaleSwitch((prev) => {
        const prevCopy = [...prev];
        prevCopy[currentIdx] = false;
        return prevCopy;
      });
      sliderStateSetFunction(setValue);
    } else if (sliderStateSetFunction === setWarmth) {
      sliderStateSetFunction((prev) => {
        const prevCopy = [...prev];
        prevCopy[currentIdx] = sliderValue / 100;
        return prevCopy;
      });
    } else if (sliderStateSetFunction === setBlur) {
      sliderStateSetFunction((prev) => {
        const prevCopy = [...prev];
        prevCopy[currentIdx] = (sliderValue / 100) * 5;
        return prevCopy;
      });
    } else if (sliderStateSetFunction === setVignette) {
      sliderStateSetFunction((prev) => {
        const prevCopy = [...prev];
        prevCopy[currentIdx] = (sliderValue / 100) * 20;
        return prevCopy;
      });
    } else {
      sliderStateSetFunction(setValue);
    }
  }
  async function exportImages() {
    const convertedImgs = await convertImageEdit(imageSliderImgs);
    next(convertedImgs);
  }

  return (
    <div className={styles.imgOuterWrapper}>
      <div
        className={styles.imgInnerWrapper}
        style={{
          transform: `scale(${scale})`,
          margin: `${(-650 + 650 * scale) / 2}px 0`,
        }}
        ref={innerWrapperRef}
      >
        <PostImageSlider
          photos={imageSliderImgs}
          onTop={false}
          getCurrentPhotoIdx={setCurrentIdx}
          props={{
            sizes: `(max-width: ${650 / 0.8}px) 80vw,
                    650px
                  `,
          }}
        />
      </div>
      <aside className={styles.editImageOptions}>
        <OptionsSlider
          options={["Skalierung", "Filter", "Anpassungen"]}
          onClick={([option, idx]) =>
            setEditOption(["scale", "filter", "anpassungen"][idx])
          }
        />

        {editOption === "scale" ? (
          <footer className={styles.scaleFooter}>
            <EditImageOption
              label={"Skalieren"}
              switchChange={scaleSwitchChangeHandler}
              sliderChange={(val) => sliderChangeHandler(setImgScale, val)}
              defaultSliderValue={50}
              value={(Math.sqrt(imgScale[currentIdx]) - 0.5) * 100}
              switchValue={imgScaleSwitch[currentIdx]}
            />
          </footer>
        ) : editOption === "filter" ? (
          <footer className={styles.filterFooter}>
            Currently there are no filters available!
          </footer>
        ) : (
          <footer className={styles.anpassungenFooter}>
            <EditImageOption
              label={"Helligkeit"}
              sliderChange={(val) => sliderChangeHandler(setBrightness, val)}
              defaultSliderValue={50}
              value={(Math.sqrt(brightness[currentIdx]) - 0.5) * 100}
            />
            <EditImageOption
              label={"Kontrast"}
              sliderChange={(val) => sliderChangeHandler(setContrast, val)}
              defaultSliderValue={50}
              value={(Math.sqrt(contrast[currentIdx]) - 0.5) * 100}
            />
            <EditImageOption
              label={"Wärme"}
              sliderChange={(val) => sliderChangeHandler(setWarmth, val)}
              defaultSliderValue={0}
              value={warmth[currentIdx] * 100}
            />
            <EditImageOption
              label={"Verblassen"}
              sliderChange={(val) => sliderChangeHandler(setBlur, val)}
              defaultSliderValue={0}
              value={(blur[currentIdx] / 5) * 100}
            />
            <EditImageOption
              label={"Vignette"}
              sliderChange={(val) => sliderChangeHandler(setVignette, val)}
              defaultSliderValue={0}
              value={(vignette[currentIdx] / 20) * 100}
            />
          </footer>
        )}

        <span>
          <Button value="Zurück" onClick={back} />
          <Button value="Weiter" onClick={exportImages} />
        </span>
      </aside>
    </div>
  );
}
