import { useState, useEffect, useContext } from "react";
import AuthContext from "../../../store/authContext";

import getAge from "../../../lib/getAge";
import styles from "./auth.module.css";

import AuthWrapper from "../AuthWrapper";
import Dropdown from "../Dropdown";
import Button from "../../little/Button";
import Footer from "../Footer";

const months = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function Birthday(props) {
  const { signup, setSignup } = useContext(AuthContext);

  const redirectBackHandler = () => {
    setSignup((prev) => ({
      ...prev,
      birthdayReady: false,
      verificationReady: false,
      password: undefined,
    }));
  };

  const [year, monthIdx, day] = signup.birthday;
  const daysInMonth = new Date(year, monthIdx, 0).getDate();

  // change birthday in context
  const changeHandler = (whatToChange, value) => {
    setSignup((prev) => {
      let newSignup = { ...prev };
      if (whatToChange === "year") newSignup.birthday[0] = value;
      else if (whatToChange === "month") newSignup.birthday[1] = value;
      else if (whatToChange === "day") newSignup.birthday[2] = value;

      return newSignup;
    });
  };

  const MIN_AGE = 5;
  const [age, setAge] = useState(0);
  useEffect(() => {
    let newAge = getAge(day, monthIdx, year);
    setAge(newAge);
  }, [signup]);

  const submitHandler = (evt) => {
    evt.preventDefault();
    props.submitHandler();
  };

  return (
    <AuthWrapper>
      <h4>Gib dein Geburtdatum an</h4>
      <p className={styles.p}>
        Dein Geburtsdatum wird in deinem öffentlichen Profil nicht angezeigt.
      </p>
      <p className={`${styles.p} ${styles.link}`}>
        Warum muss ich mein Geburtsdatum angeben?
      </p>
      <form onSubmit={submitHandler}>
        <section className={styles.dropdownWrapper}>
          <Dropdown
            name="month"
            options={months}
            defaultValue={months[monthIdx]}
            onChange={(evt) =>
              changeHandler("month", months.indexOf(evt.target.value))
            }
          />
          <Dropdown
            name="days"
            options={Array.from({ length: daysInMonth }, (_, i) => i + 1)}
            defaultValue={day}
            onChange={(evt) => changeHandler("day", Number(evt.target.value))}
          />
          <Dropdown
            name="year"
            options={Array.from(
              { length: new Date().getFullYear() - 1919 + 1 },
              (_, i) => i + 1919
            ).reverse()}
            defaultValue={year}
            onChange={(evt) => changeHandler("year", Number(evt.target.value))}
          />
        </section>
        <p className={`${styles.p} ${styles.information}`}>
          Du musst dein Geburtsdatum eingeben.
        </p>
        <p className={`${styles.p} ${styles.margin} ${styles.information}`}>
          Gib bitte dein eigenes Geburtsdatum an, selbst wenn dies ein Konto für
          ein Unternehmen, ein Haustier oder etwas anderes ist.
        </p>
        <Button
          value="Weiter"
          className={styles.forgotPassword}
          disabled={age < MIN_AGE}
        />
      </form>
      <h5 onClick={redirectBackHandler} className={styles.link}>
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

export default Birthday;
