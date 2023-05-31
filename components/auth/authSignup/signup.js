import { useState, useContext } from "react";

import AuthContext from "../../../store/authContext";
import styles from "./auth.module.css";

import AuthWrapper from "../AuthWrapper";
import Input from "../Input/index";
import SelectionInput from "../SelectionInput/index";
import Button from "../../little/Button";
import Footer from "../Footer";

import validateUser from "../../../lib/validate/validateNewUser";
import addressOptions from "../../../lib/phoneNumberDialCodes";

const SelectionInputMultipleOptions_methods = [
  {
    name: "Telefonnummer",
    options: addressOptions,
    defaultOption: "DE",
    icon: <i className="fa-solid fa-phone"></i>,
  },
  { name: "E-Mail", icon: <i className="fa-solid fa-at"></i> },
];

function Signup(props) {
  const { signup } = useContext(AuthContext);

  // [address, name, username, password] all items have to be true in order to enable the submit button
  const [validate, setValidate] = useState([false, false, false, false]);
  const [errorMessages, setErrorMessages] = useState({});

  const validateHandler = async (whatToValidate, str) => {
    const userObj = {};
    userObj[whatToValidate] = str;
    const validateStr = await validateUser(userObj);
    const valid = !validateStr.errors[whatToValidate] && !!str;

    // show errors on input field
    if (!valid && !!str) {
      const newErrorMessages = validateStr.errors[whatToValidate];
      // convert string to array
      const parsedErrorMessages = JSON.parse(
        `["${newErrorMessages.replaceAll(",", '", "')}"]`
      );
      setErrorMessages((prev) => ({
        ...prev,
        [whatToValidate]: parsedErrorMessages,
      }));
    } else {
      setErrorMessages((prev) => ({ ...prev, [whatToValidate]: [] }));
    }

    setValidate((prev) => {
      let newValidate = [...prev];
      const options = ["address", "name", "username", "password"];
      newValidate[options.indexOf(whatToValidate)] = valid;
      if (whatToValidate === "email" || whatToValidate === "phoneNumber") {
        newValidate[0] = valid;
      }
      return newValidate;
    });
    return valid;
  };

  // [value, method Name, activeOptionDialCode(optional)]
  const [addressInputValue, setAddressInputValue] = useState([]);

  const submitHandler = (evt) => {
    evt.preventDefault();
    let inputValues = [...evt.target.childNodes].map(
      (div) => div.lastChild.value
    );
    props.submitHandler({
      username: inputValues[2],
      password: inputValues[3],
      name: inputValues[1],
      email:
        addressInputValue[1] === "E-Mail" ? addressInputValue[0] : undefined,
      phoneNumber:
        addressInputValue[1] === "Telefonnummer"
          ? addressInputValue[0]
          : undefined,
      dialCode:
        addressInputValue[1] === "Telefonnummer"
          ? addressInputValue[2]
          : undefined,
    });
  };

  return (
    <AuthWrapper>
      <h5>
        Registriere dich, um die Fotos und Videos deiner Freunde zu sehen.
      </h5>
      <form className={styles.form} onSubmit={submitHandler}>
        <SelectionInput
          methods={SelectionInputMultipleOptions_methods}
          defaultMethod="E-Mail"
          validate={(inputValue, method, methodValue) => {
            if (method === "E-Mail")
              return validateHandler("email", inputValue);

            return validateHandler(
              "phoneNumber",
              `${methodValue}${inputValue}`
            );
          }}
          change={(...args) => setAddressInputValue(args)}
          value={[
            { method: "E-Mail", value: signup.email },
            { method: "Telefonnummer", value: signup.phoneNumber },
          ]}
          errorMessages={errorMessages.email || errorMessages.phoneNumber}
        />
        <Input
          type="text"
          placeholder="Vollständiger Name"
          validate={(str) => validateHandler("name", str)}
          value={signup.name}
          errorMessages={errorMessages.name}
        />
        <Input
          type="text"
          placeholder="Benutzername"
          validate={(str) => validateHandler("username", str)}
          value={signup.username}
          errorMessages={errorMessages.username}
        />
        <Input
          type="password"
          placeholder="Passwort"
          validate={(str) => validateHandler("password", str)}
          value={signup.password}
          errorMessages={errorMessages.password}
        />
        <Button value="Weiter" disabled={validate.includes(false)} />
      </form>

      <Footer>
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
