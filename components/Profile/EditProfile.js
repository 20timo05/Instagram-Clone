import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";

import { link as linkStyles } from "../Post/postHeader.module.css";
import styles from "./editProfile.module.css";
import changeProfileImagePopUpStyles from "../Post/postHeader.module.css";
import PopUp from "../PopUp";
import LoadingAnimation from "../little/LoadingAnimation";
import Input from "../auth/Input/index";
import CaptionTextArea from "./CaptionTextArea";
import SelectionInput from "../auth/SelectionInput/index";
import Button from "../little/Button";

import useFetch, { fetchData } from "../../hooks/useFetch";
import addressOptions from "../../lib/phoneNumberDialCodes";
import validatePhoneNumber from "../../lib/validate/phoneNumber";
import validateEmail from "../../lib/validate/email";
import validateNewUser from "../../lib/validate/validateNewUser";
import ProfileImage from "../little/ProfileImage";

export default function EditProfile({ close, currentLoggedInUser }) {
  const [showChangeProfileImagePopUp, setShowChangeProfileImagePopUp] =
    useState(false);

  const [userData, setUserData, loading] = useFetch(
    "GET",
    "/api/user/getUser",
    {
      username: currentLoggedInUser.username,
    }
  );

  const [dataValid, setDataValid] = useState({
    usernameValid: true,
    usernameErrorMessages: [],
    phoneNumberValid: false,
    emailValid: false,
  });

  useEffect(() => {
    if (!loading || !userData) return;
    setDataValid((prev) => ({
      ...prev,
      phoneNumberValid: !!userData.phoneNumber,
      emailValid: !!userData.email,
    }));
  }, [userData, loading]);

  const defaultPhoneNumberDialCodeOption =
    addressOptions?.find((option) => option.dial_code === userData?.dialCode)
      ?.code || "DE";

  const submitHandler = async () => {
    console.log(userData);
    const result = await fetchData("PUT", "/api/user/setUser", userData);
    if (result.ok && result.data.todo === "logout") {
      // logout
      await signOut();
    } else {
      console.log(result);
    }
  };

  const changeProfilePicture = async () => {
    //check if user already has profile image
    const hasAlready = await isValidImageSrc(
      `/api/image/profile_images/${userData.username}.jpg`
    );
    if (hasAlready) setShowChangeProfileImagePopUp(true);
    else inputRef.current.click();
  };

  const inputRef = useRef(null);
  const uploadProfilePicture = async (evt) => {
    const file = evt.target.files[0];
    // upload to server and save it in public directory
    const formData = new FormData();
    formData.append("profilePicture", file);
    await fetch("/api/user/uploadProfilePicture", {
      method: "POST",
      body: formData,
    });
    setShowChangeProfileImagePopUp(false);
  };

  const deleteProfilePicture = async () => {
    // upload to server and save it in public directory
    await fetch("/api/user/uploadProfilePicture", { method: "DELETE" });
    setShowChangeProfileImagePopUp(false);
  };

  return (
    <>
      <input
        type="file"
        accept="image/jpeg"
        style={{ display: "none" }}
        ref={inputRef}
        multiple={false}
        onChange={uploadProfilePicture}
      />
      {showChangeProfileImagePopUp && (
        <PopUp
          title="Profilbild ändern"
          close={() => setShowChangeProfileImagePopUp(false)}
          className={`${changeProfileImagePopUpStyles.optionsWrapper} ${changeProfileImagePopUpStyles.shareWrapper}`}
        >
          <div
            style={{ color: "var(--blue)" }}
            onClick={() => inputRef.current.click()}
          >
            Foto hochladen
          </div>
          <div style={{ color: "var(--red)" }} onClick={deleteProfilePicture}>
            Aktuelles Foto entfernen
          </div>
          <div onClick={() => setShowChangeProfileImagePopUp(false)}>
            Abbrechen
          </div>
        </PopUp>
      )}
      <PopUp title="Profil bearbeiten" close={close}>
        {loading ? (
          <LoadingAnimation />
        ) : (
          <section className={styles.wrapper}>
            <header>
              <div
                className={styles.imageWrapper}
                onClick={changeProfilePicture}
              >
                <ProfileImage
                  username={userData?.username}
                  height="60"
                  width="60"
                />
              </div>
              <div className={styles.changeImageWrapper}>
                <h1>{userData?.username}</h1>
                <span className={linkStyles} onClick={changeProfilePicture}>
                  Profilbild ändern
                </span>
              </div>
            </header>
            <section>
              <h3>Name</h3>
              <div>
                <Input
                  placeholder="Name"
                  value={userData?.full_name}
                  change={(full_name) =>
                    setUserData((prev) => ({ ...prev, full_name }))
                  }
                />
                <p>
                  Anhand des Namens, unter dem man dich kennt, können andere
                  Personen dein Konto leichter finden. Verwende deshalb deinen
                  vollständigen Namen, Spitznamen oder Geschäftsnamen.
                </p>
              </div>
              <h3>Benutzername</h3>
              <div>
                <Input
                  placeholder="Benutzername"
                  value={userData?.username}
                  validate={async (inputValue) => {
                    setUserData((prev) => ({
                      ...prev,
                      username: inputValue,
                    }));

                    if (inputValue === currentLoggedInUser.username) {
                      setDataValid((prev) => ({
                        ...prev,
                        usernameValid: true,
                        usernameErrorMessages: [],
                      }));
                      return true;
                    }

                    const { errors } = await validateNewUser({
                      username: inputValue,
                    });
                    const valid = Object.keys(errors).length === 0;
                    setDataValid((prev) => ({
                      ...prev,
                      username: inputValue,
                      usernameValid: valid,
                      usernameErrorMessages: Object.values(errors),
                    }));
                    return valid;
                  }}
                  errorMessages={dataValid.usernameErrorMessages}
                />
                <p>
                  Dein Benutzername ist dein einzigartiger Name auf Instagram,
                  der in der URL deines Profils und in deinen Beiträgen
                  angezeigt wird. Er sollte einfach zu merken sein und am besten
                  deinen Namen, Spitznamen oder dein Unternehmen widerspiegeln.
                </p>
              </div>
              <h3>Steckbrief</h3>
              <CaptionTextArea
                caption={userData?.description}
                setCaption={(description) =>
                  setUserData((prev) => ({ ...prev, description }))
                }
                maxLength={150}
              />
              <h3></h3>
              <span>
                <h4>Persönliche Informationen</h4>
                <p>
                  Bitte gib deine persönlichen Informationen an, auch wenn das
                  Konto für ein Unternehmen, ein Haustier o. Ä. verwendet wird.
                  Diese Informationen werden nicht in deinem öffentlichen Profil
                  angezeigt.
                </p>
              </span>
              <h3>Telefonnummer</h3>
              <SelectionInput
                methods={[
                  {
                    name: "Telefonnummer",
                    options: addressOptions,
                    defaultOption: defaultPhoneNumberDialCodeOption,
                    icon: <i className="fa-solid fa-phone"></i>,
                  },
                ]}
                defaultMethod="Telefonnummer"
                validate={(inputValue, method, methodValue) => {
                  const valid = validatePhoneNumber(
                    `${methodValue}${inputValue}`
                  );
                  setDataValid((prev) => ({
                    ...prev,
                    phoneNumberValid: valid,
                  }));
                  return valid;
                }}
                change={(value, method, dialCode) =>
                  setUserData((prev) => ({
                    ...prev,
                    dialCode,
                    phoneNumber: value,
                  }))
                }
                value={[
                  { method: "Telefonnummer", value: userData?.phoneNumber },
                ]}
              />
              <h3>E-Mail</h3>
              <Input
                type="text"
                placeholder="E-Mail"
                validate={(inputValue) => {
                  const valid = validateEmail(inputValue);
                  setDataValid((prev) => ({ ...prev, emailValid: valid }));
                  return valid;
                }}
                change={(email) => setUserData((prev) => ({ ...prev, email }))}
                value={userData?.email}
              />
              <h3></h3>
              <Button
                value="Senden"
                disabled={
                  !dataValid.usernameValid ||
                  (!dataValid.phoneNumberValid && !dataValid.emailValid)
                }
                onClick={submitHandler}
              />
              <span></span>
            </section>
          </section>
        )}
      </PopUp>
    </>
  );
}

export async function isValidImageSrc(url) {
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.src = url;

      img.onload = () => resolve();
      img.onerror = () => reject();
    });
    return true;
  } catch (err) {
    return false;
  }
}
