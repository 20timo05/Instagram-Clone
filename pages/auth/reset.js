import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

import styles from "../../components/auth/authSignup/auth.module.css";
import AuthWrapper from "../../components/auth/AuthWrapper";
import SelectionInput from "../../components/auth/SelectionInput/index";
import Button from "../../components/little/Button";
import OtherOptionLabel from "../../components/auth/OtherOptionLabel";
import Footer from "../../components/auth/Footer";

import VerificationCodePage from "../../components/auth/authSignup/verificationCodePage";
import startVerification from "../../lib/verificationCode/startVerification";
import { fetchData } from "../../hooks/useFetch";

import addressOptions from "../../lib/phoneNumberDialCodes";

const SelectionInputMultipleOptions_methods = [
  {
    name: "Telefonnummer",
    options: addressOptions,
    defaultOption: "DE",
    icon: <i className="fa-solid fa-phone"></i>,
  },
  { name: "E-Mail", icon: <i className="fa-solid fa-at"></i> },
  { name: "Benutzername", icon: <i className="fa-solid fa-user"></i> },
];

function Reset() {
  const router = useRouter();
  const [verificationCodeReady, setVerificationCodeReady] = useState(false);
  const [verificationCodeTries, setVerificationCodeTries] = useState(5);

  // [value, method Name, activeOptionDialCode(optional)]
  const [addressInputValue, setAddressInputValue] = useState([]);
  const method =
    addressInputValue[1] === "Benutzername"
      ? "username"
      : addressInputValue[1] === "Telefonnummer"
      ? "phoneNumber"
      : "email";

  const submitHandler = async (evt) => {
    evt.preventDefault();
    if (verificationCodeTries <= 0) return;

    // if the method is username
    let user;

    // retrieve user from database
    const getUserResponse = await fetchData("GET", `/api/lib/checkUser`, {
      data: addressInputValue[0],
      method,
      dialCode: addressInputValue[2],
    });
    const { exists, result } = getUserResponse.data;

    user = result[0];

    // send verification code
    startVerification(user);
    setVerificationCodeReady(true);
    if (method === "username") {
      const isEmail = !!user.email && user.email !== "undefined";
      setAddressInputValue(() => [
        isEmail ? user.email : user.phoneNumber,
        isEmail ? "E-Mail" : "Telefonnummer",
        !isEmail ? user.dialCode : "",
      ]);
    }
  };

  const verificationSubmitHandler = async (verificationCode) => {
    if (verificationCodeTries <= 0) return;
    setVerificationCodeTries((prev) => prev - 1);

    const result = await signIn("codeLogin", {
      redirect: false,
      data: addressInputValue[0],
      method,
      dialCode: addressInputValue[2],
      verificationCode,
    });

    if (!result.ok) return console.log(result);

    router.push("/auth/changePassword");
  };

  const changeToSignupHandler = (evt) => router.push("/auth/signup");
  const changeToLoginHandler = (evt) => router.push("/auth/login");

  return (
    <>
      {!verificationCodeReady ? (
        <AuthWrapper>
          <h1 className={styles.h1}>Probleme beim Anmelden?</h1>
          <p className={styles.p}>
            Gib deine E-Mail-Adresse, deine Telefonnummer oder deinen
            Benutzernamen ein, damit wir dir einen Link senden können, mit dem
            du zurück in dein Konto gelangst.
          </p>
          <form className={styles.form} onSubmit={submitHandler}>
            <SelectionInput
              methods={SelectionInputMultipleOptions_methods}
              defaultMethod={"E-Mail"}
              change={(...args) => setAddressInputValue(args)}
            />
            <Button value="Code zum Anmelden senden" />
          </form>
          <OtherOptionLabel />
          <h5 onClick={changeToSignupHandler} className={styles.h5}>
            Neues Konto erstellen
          </h5>
          <Footer>
            <h5
              onClick={changeToLoginHandler}
              style={{ margin: 0 }}
              className={styles.h5}
            >
              Zurück zur Anmeldung
            </h5>
          </Footer>
        </AuthWrapper>
      ) : (
        <VerificationCodePage
          changeLoginHandler={changeToLoginHandler}
          submitHandler={verificationSubmitHandler}
          tries={verificationCodeTries}
          redirectBackHandler={() => setVerificationCodeReady(false)}
          email={addressInputValue[1] === "E-Mail" ? addressInputValue[0] : ""}
          phoneNumber={
            addressInputValue[1] === "Telefonnummer" ? addressInputValue[0] : ""
          }
          dialCode={
            addressInputValue[1] === "Telefonnummer" ? addressInputValue[2] : ""
          }
        />
      )}
    </>
  );
}

export default Reset;
