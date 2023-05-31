import { useState, useEffect, useRef } from "react";

import styles from "./style.module.css";

export default function Input(props) {
  const {
    placeholder,
    value: inputValue = "",
    type = "text",
    validate,
    change,
    className,
    customRef,
    triggerValidate,
    errorMessages = [],
    ...inputProps
  } = props;

  const inputRef = useRef(null);
  const [value, setValue] = useState(inputValue);
  const [valid, setValid] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // validate defaultValue
  useEffect(() => {
    changeHandler(value, false);
  }, [triggerValidate]);

  useEffect(() => {
    changeHandler(inputValue, false);
  }, [inputValue]);

  async function changeHandler(evt, isEvent = true) {
    const newValue = isEvent ? evt.target.value : evt;
    setValue(newValue);

    if (change) {
      change(newValue);
    }

    if (validate) {
      const result = await validate(newValue);
      setValid(result);
    }
  }
  const [errorMessagesVisible, setErrorMessagesVisible] = useState(false);
  const errorMessagesTags = errorMessages.map((item) => (
    <li key={item}>{item}</li>
  ));

  return (
    <div className={styles.wrapper} ref={customRef}>
      {/* Placeholder (it moves when input is active, animation with css) */}
      <p
        className={`${styles.placeholder} ${
          value.length > 0 ? styles.valueAnimation : ""
        }`}
      >
        {placeholder}
      </p>

      {/* wrapper for icon input valid or invalid (green checkmark or red cross) and if the type is password than show and hide functionality */}
      <div
        className={styles.optionsWrapper}
        onClick={() => setErrorMessagesVisible((prev) => !prev)}
      >
        {(validate || !!errorMessages.length) && value && (
          /* icon input valid or invalid */
          <div
            className={`${styles.iconWrapper} ${
              valid ? styles.valid : styles.invalid
            }`}
          >
            {valid ? (
              <i className="fa-solid fa-check"></i>
            ) : (
              <i className="fa-solid fa-xmark"></i>
            )}
            {errorMessagesVisible && (
              <ul className={styles.errorMessages}>{errorMessagesTags}</ul>
            )}
          </div>
        )}

        {/* text for show or hide */}
        {type == "password" && value && (
          <div
            className={styles.passwordVisible}
            onClick={() => {
              setPasswordVisible(!passwordVisible);
              console.log(inputRef.current);
              inputRef.current.focus({ focusVisible: true });
            }}
          >
            {passwordVisible ? "Verbergen" : "Anzeigen"}
          </div>
        )}
      </div>

      {/* input element itself */}
      <input
        className={`${className ? className : ""} ${styles.input} ${
          value.length > 0 ? styles.valueAnimation : ""
        }`}
        value={value}
        onChange={changeHandler}
        ref={inputRef}
        type={type == "text" || passwordVisible ? "text" : "password"}
        {...inputProps}
      />
    </div>
  );
}
