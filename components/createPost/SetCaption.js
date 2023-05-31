import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

import editImageStyles from "./editImage.module.css";
import styles from "./setCaption.module.css";

import PostImageSlider from "../Post/PostImageSlider";
import DropdownMenu from "./DropdownMenu";
import EnterLocation from "./EnterLocation";
import Input from "../auth/Input/index";
import Button from "../little/Button";
import ToggleSwitch from "../little/ToggleSwitch";
import Popup from "../PopUp";
import SearchBar from "../Header/Searchbar";
import PeopleTag from "../Post/PeopleTag";
import CaptionTextArea from "../Profile/CaptionTextArea";

import useWindowSize from "../../hooks/useWindowSize";
import ProfileImage from "../little/ProfileImage";

export default function SetCaption({
  imgObj,
  setImgObj,
  caption,
  setCaption,
  location,
  setLocation,
  setAllowLikes,
  setAllowComments,
  currentLoggedInUser,
  submit,
  back,
}) {
  const captionRef = useRef(null);

  const [showMap, setShowMap] = useState(false);
  const [searchPeopleTag, setSearchPeopleTag] = useState(false);

  useEffect(() => {
    captionRef.current?.focus();
  }, []);

  const alternativeTextHandler = (val, id) => {
    setImgObj((prev) => {
      const newPrev = [...prev];
      newPrev[newPrev.findIndex((item) => item.id === id)].alternativeText =
        val;
      return newPrev;
    });
  };

  const [currentIdx, setCurrentIdx] = useState(0);

  const [showPeopleTagPopup, setShowPeopleTagPopup] = useState(null);

  const addPeopleTagHandler = (evt) => {
    if (
      evt.target.tagName === "I" ||
      evt.target.parentNode.classList[0].includes("dots") ||
      [...evt.target.classList].includes("wrapper")
    )
      return;

    const { clientX, clientY } = evt;
    const { top, left } = evt.target.getBoundingClientRect();

    const relativeX = clientX - left;
    const relativeY = clientY - top;

    setShowPeopleTagPopup({ x: relativeX, y: relativeY });
  };

  const selectPeopleTagHandler = (value, type, data) => {
    setImgObj((prev) => {
      const newPrev = [...prev];
      const tag = {
        userId: data.id,
        username: data.username,
        ...showPeopleTagPopup,
      };
      newPrev[
        newPrev.findIndex((item) => item.id === currentIdx)
      ].peopleTags.push(tag);
      return newPrev;
    });

    setShowPeopleTagPopup(null);
  };

  // responsive
  const [scale, setScale] = useState(1);
  const { height, width } = useWindowSize();

  useEffect(() => {
    if (!height || !width) return;

    if (width > 800) {
      const newScale = Math.min((width * 0.8) / 1300, 1);
      setScale(newScale);
    } else {
      const newScale = Math.min((width * 0.8) / 650, 1);
      setScale(newScale);
    }
  }, [height, width]);

  return (
    <>
      <style jsx>{`
        p {
          opacity: 0.5;
          font-size: 0.8rem;
        }
      `}</style>
      <div className={styles.wrapper}>
        <div
          className={editImageStyles.imgInnerWrapper}
          style={{
            transform: `scale(${scale})`,
            margin: `${(-650 + 650 * scale) / 2}px`,
          }}
          onClick={addPeopleTagHandler}
        >
          <PostImageSlider
            photos={imgObj.map((img) => ({
              image_url: img.src,
              id: img.id,
              position: img.id,
            }))}
            onTop={false}
            getCurrentPhotoIdx={setCurrentIdx}
          />
          {imgObj[
            imgObj.findIndex((item) => item.id === currentIdx)
          ].peopleTags.map((person) => (
            <PeopleTag key={person.userId} {...person} />
          ))}
        </div>
        <aside className={styles.aside}>
          <div onClick={back}>
            <i className="fa-solid fa-angles-left"></i> Zurück
          </div>
          <header>
            <ProfileImage
              username={currentLoggedInUser.username}
              height="35"
              width="35"
            />
            {currentLoggedInUser.username}
          </header>
          <CaptionTextArea
            caption={caption}
            setCaption={setCaption}
            maxLength={2200}
            captionRef={captionRef}
          />
          <footer className={styles.footer}>
            <div onClick={() => setShowMap(true)}>
              {location.name ? location.name : "Ort hinzufügen"}
              <i className="fa-solid fa-location-dot"></i>
            </div>
            {showMap && (
              <EnterLocation
                close={(mapPos) => {
                  console.log(mapPos);
                  setShowMap(false);
                  setLocation(mapPos);
                }}
              />
            )}
            <DropdownMenu title="Barrierefreiheit">
              <p>
                Alternativtexte beschreiben deine Fotos für Personen mit
                Sehbehinderung und werden für deine Fotos automatisch erstellt,
                wenn du keinen eigenen Alternativtext eingibst.
              </p>
              {imgObj.map((img) => (
                <div key={img.id} className={styles.alternativeText}>
                  <Image
                    src={img.src}
                    height="50"
                    width="50"
                    alt="Image Display"
                    style={{ objectFit: "cover" }}
                  />
                  <Input
                    placeholder="Alternativtext verfassen..."
                    change={(val) => alternativeTextHandler(val, img.id)}
                  />
                </div>
              ))}
            </DropdownMenu>
            <DropdownMenu title="Erweiterte Einstellungen">
              <section className={styles.advancedSettings}>
                <div>
                  Anzahl der „Gefällt mir“-Angaben und Aufrufe für diesen
                  Beitrag verbergen
                  <ToggleSwitch onChange={(val) => setAllowLikes(!val)} />
                </div>
                <p>
                  Nur du kannst sehen, wie oft dieser Beitrag mit „Gefällt mir“
                  markiert und angesehen wurde. Du kannst dies später über das
                  Menü ··· oben im Beitrag wieder ändern. Wenn du die Anzahl der
                  „Gefällt mir“-Angaben für Beiträge anderer Personen verbergen
                  möchtest, kannst du das in deinen Kontoeinstellungen tun. Mehr
                  dazu
                </p>
              </section>
              <section className={styles.advancedSettings}>
                <div>
                  Kommentarfunktion deaktivieren
                  <ToggleSwitch onChange={(val) => setAllowComments(!val)} />
                </div>
                <p>
                  Du kannst das später ändern, indem du oben in deinem Beitrag
                  zum Menü ··· gehst.
                </p>
              </section>
            </DropdownMenu>
            <Link href={`/${currentLoggedInUser.username}`}>
              <Button
                value="Veröffentlichen"
                onClick={submit}
                disabled={caption.length === 0}
              />
            </Link>
          </footer>
        </aside>
      </div>
      {showPeopleTagPopup && (
        <Popup
          title="Personen markieren"
          close={() => setShowPeopleTagPopup(false)}
          className={styles.addPeopleTagsWrapper}
          style={{
            transform: `scale(${Math.min((width * 0.9) / 446, 1)})`,
            margin: `${(-650 + 650 * Math.min((width * 0.9) / 446, 1)) / 2}px`,
          }}
        >
          <SearchBar
            currentLoggedInUser={currentLoggedInUser}
            onlyFollowers={true}
            mostPopular={true}
            onSelect={selectPeopleTagHandler}
          />
        </Popup>
      )}
    </>
  );
}
