import { useState } from "react";
import { useRouter } from "next/router";

import styles from "../../components/auth/authSignup/auth.module.css";
import AuthWrapper from "../../components/auth/AuthWrapper";
import Input from "../../components/auth/Input/index";
import Button from "../../components/little/Button";
import Footer from "../../components/auth/Footer";

import validatePassword from "../../lib/validate/password";
import { fetchData } from "../../hooks/useFetch";

function ChangePassword() {
  const router = useRouter();

  const [value, setValue] = useState("");
  // check if there are errorMessages left => not valid yet
  const [errorMessages, setErrorMessages] = useState([]);

  const submitHandler = async (evt) => {
    evt.preventDefault();

    const res = await fetchData("PATCH", "/api/lib/changePassword", {
      newPassword: value,
    });

    if (res.error) {
      console.log(res.error);
    } else {
      router.push("/");
    }
  };

  const validateHandler = (str) => {
    const [valid, passwordErrors] = validatePassword(str);
    setErrorMessages(passwordErrors);
    return valid;
  };

  const changeToHomePage = () => router.push("/");

  return (
    <AuthWrapper>
      <form className={styles.form} onSubmit={submitHandler}>
        <Input
          type="password"
          placeholder="Neues Passwort"
          validate={validateHandler}
          errorMessages={errorMessages}
          onChange={(evt) => setValue(evt.target.value)}
          value={value}
        />
        <Button value="Passwort ändern" disabled={errorMessages.length} />
        <Footer>
          <h5
            onClick={changeToHomePage}
            style={{ margin: 0 }}
            className={styles.h5}
          >
            Zurück zur Homepage
          </h5>
        </Footer>
      </form>
    </AuthWrapper>
  );
}

export default ChangePassword;
