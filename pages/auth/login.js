import { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";

import styles from "../../components/auth/authSignup/auth.module.css";
import AuthWrapper from "../../components/auth/AuthWrapper";
import Input from "../../components/auth/Input/index";
import SelectionInput from "../../components/auth/SelectionInput/index";
import Button from "../../components/little/Button";
import OtherOptionLabel from "../../components/auth/OtherOptionLabel";
import OtherOption from "../../components/auth/OtherOption";
import Footer from "../../components/auth/Footer";

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

function Login() {
  const router = useRouter();

  // [value, method Name, activeOptionDialCode(optional)]
  const [addressInputValue, setAddressInputValue] = useState([]);
  const [addressErrors, setAddressErrors] = useState([]);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const submitHandler = async (evt) => {
    evt.preventDefault();

    const password = evt.target.childNodes[1].lastChild.value;
    const method =
      addressInputValue[1] === "Benutzername"
        ? "username"
        : addressInputValue[1] === "Telefonnummer"
        ? "phoneNumber"
        : "email";

    // log User in
    const result = await signIn("credentialsLogin", {
      redirect: false,
      data: addressInputValue[0],
      method,
      password,
      dialCode: addressInputValue[2],
    });

    if (!result.ok) {
      setPasswordErrors([result.error]);
      console.log(result.error);
    } else {
      router.push("/");
    }
  };

  const signInWithGoogleHandler = async () => {
    const result = await signIn("google", { redirect: false });
    if (!result?.ok) {
      if (result?.error === "No user found!") {
        setAddressErrors([result.error]);
      } else if (result?.error === "Invalid password!") {
        setPasswordErrors([result.error]);
      } else {
        console.log(result?.error)
      }
    } else {
      router.push("/");
    }
  };

  const signInWithFacebookHandler = async () => {
    const result = await signIn("facebook", { redirect: false });
    if (!result?.ok) {
      console.log(result.error);
    } else {
      router.push("/");
    }
  };

  const forgotPasswordHandler = () => router.push("/auth/reset");
  const changeSignupHandler = () => router.push("/auth/signup");

  return (
    <AuthWrapper>
      <form className={styles.form} onSubmit={submitHandler}>
        <SelectionInput
          methods={SelectionInputMultipleOptions_methods}
          defaultMethod={"Benutzername"}
          change={(...args) => {
            setAddressInputValue(args);
            if (addressErrors.length > 0) setAddressErrors([]);
          }}
          errorMessages={addressErrors}
        />
        <Input
          type="password"
          placeholder="Passwort"
          errorMessages={passwordErrors}
          change={() => {
            if (passwordErrors.length > 0) setPasswordErrors([]);
          }}
        />
        <Button value="Anmelden" />
      </form>
      <OtherOptionLabel />
      <OtherOption option="Google" onClick={signInWithGoogleHandler} />
      <OtherOption option="Facebook" onClick={signInWithFacebookHandler} />
      <h5 onClick={forgotPasswordHandler} className={styles.h5}>
        Passwort vergessen?
      </h5>
      <Footer spacer={false}>
        <h5 style={{ margin: 0 }}>
          Du hast kein Konto?{" "}
          <span onClick={changeSignupHandler} className={styles.link}>
            Registrieren
          </span>
        </h5>
      </Footer>
    </AuthWrapper>
  );
}

export default Login;
