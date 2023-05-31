import { useState, useEffect } from "react";

import styles from "./auth.module.css";

import AuthWrapper from "../AuthWrapper";
import Input from "../Input/index";
import Button from "../../little/Button";
import Footer from "../Footer";

import startVerification from "../../../lib/verificationCode/startVerification";

function Signup(props) {
  const { email, phoneNumber, dialCode } = props;
  const isEmail = !!email;
  useEffect(() => {
    if (!isEmail) console.log("https://everify.dev/sandbox");
  }, []);

  const [valid, setValid] = useState(false);

  const submitHandler = (evt) => {
    evt.preventDefault();
    let inputValues = [...evt.target.childNodes].map(
      (div) => div.lastChild.value
    );
    props.submitHandler(...inputValues);
  };

  return (
    <AuthWrapper>
      <h5>Gib den Bestätigungscode ein</h5>
      <p className={styles.p}>
        Gib den Bestätigungscode ein, den wir an{" "}
        {isEmail ? (
          <a href={`mailto:${email}`}>{email}</a>
        ) : (
          <a href={`tel:${dialCode}${phoneNumber}`}>
            {`${dialCode} ${phoneNumber}`}
          </a>
        )}{" "}
        gesendet haben. <br />
        <span onClick={startVerification} className={styles.link}>
          Code erneut senden.
        </span>
      </p>
      <form className={styles.form} onSubmit={submitHandler}>
        <Input
          type="text"
          placeholder="Bestätigungscode"
          change={(str) => setValid(str.length >= 6)}
        />
        <span className={styles.span}>Du hast noch {props.tries} Versuche</span>
        <Button
          value="Weiter"
          disabled={!valid}
          style={{ marginTop: "30px" }}
        />
      </form>
      <h5 onClick={props.redirectBackHandler} className={styles.link}>
        Zurück
      </h5>

      <Footer spacer={false}>
        <h5 style={{ margin: 0 }}>
          Du hast ein Konto?{" "}
          <span onClick={props.changeLoginHandler} className={styles.link}>
            Melde dich an.
          </span>
        </h5>
      </Footer>
    </AuthWrapper>
  );
}

export default Signup;
