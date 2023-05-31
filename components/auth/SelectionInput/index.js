import { useState, useEffect, useRef } from "react";

import styles from "./style.module.css";
import useSelectOptionsWithKeys from "../../../hooks/useSelectOptionsWithKeys";
import useLooseFocus from "../../../hooks/useLooseFocus";

import Menu from "./Menu";
import MethodPicker from "./MethodPicker";
import Input from "../Input/index";

export default function SelectionInput(props) {
  const { errorMessages = [] } = props;

  // get default method
  const selectionInputMethod =
    props.methods.find((method) => method.name === props.defaultMethod) ||
    props.methods[0];
  const [method, setMethod] = useState(selectionInputMethod);

  useEffect(() => {
    setOptions(method.options);
    if (!activeOption) setActiveOption(method.defaultOption);
  }, [method]);

  const [options, setOptions] = useState(method.options);
  const [searchCountryValue, setSearchCountryValue] = useState("");
  const optionsAvailable = !!options?.length || searchCountryValue;

  // active option: the one which is displayed next to the input field for the phone number and it has the checkmark
  const [activeOption, setActiveOption] = useState(method.defaultOption);
  const { flag: activeOptionFlag, dial_code: activeOptionDialCode } =
    method.options?.find((option) => option.code === activeOption) || {};

  // selected option: the user navigates with arrow keys
  let [currentOptionIdx, resetCurrentOptionsIdx] = useSelectOptionsWithKeys(
    options?.length,
    submit
  );

  const selectOptionsRef = useRef(null);

  useEffect(() => {
    if (!selectOptionsRef?.current || currentOptionIdx === -1) return;

    const item = selectOptionsRef.current.childNodes[currentOptionIdx];
    // check if item is in viewport
    const topDifference =
      item.getBoundingClientRect().top -
      selectOptionsRef.current.getBoundingClientRect().top;

    // item is too low -> scroll down so that it is at the bottom
    if (
      topDifference >= selectOptionsRef.current.getBoundingClientRect().height
    ) {
      item.scrollIntoView(false);
    }

    // item too hight -> scroll up so that it is at the top
    if (topDifference < 0) {
      item.scrollIntoView(true);
    }
  }, [currentOptionIdx, selectOptionsRef]);

  // like click on currentOption
  function submit(currentIdx) {
    if (!selectOptionsRef?.current || currentIdx === -1) return;

    const selectedOptionCode =
      selectOptionsRef.current.childNodes[currentIdx].getAttribute("data-code");
    setActiveOption(selectedOptionCode);
    setOptionsOpen(false);
    setSearchCountryValue("");
    setOptions(method.options);
  }

  // check for clicks on the window (close the options menu)
  const selectionWrapperRef = useRef(null);
  const searchCountryInputRef = useRef(null);

  const [optionsOpen, setOptionsOpen] = useLooseFocus(
    [selectionWrapperRef],
    [searchCountryInputRef]
  );
  useEffect(() => {
    resetCurrentOptionsIdx();
    selectOptionsRef?.current.scrollTo({ top: 0 });

    if (optionsOpen) {
      searchCountryInputRef?.current?.childNodes[2]?.focus();
    }
  }, [optionsOpen, options]);

  // search for country
  const searchCountryChangeHandler = (str) => {
    setSearchCountryValue(str);
    if (optionsAvailable)
      setOptions(
        method.options.filter(
          (option) =>
            option.name.substring(0, str.length).toLowerCase() ===
            str.toLowerCase()
        )
      );
  };

  // validate functionality
  const defaultInputValue = props.value?.find((item) => item.method === method.name).value || ""
  const [inputValue, setInputValue] = useState(defaultInputValue);

  const [triggerInputValidate, setTriggerInputValidate] = useState(0);

  const inputChangeHandler = (str) => {
    setInputValue(str);
    if (props.change) props.change(str, method.name, activeOptionDialCode);
  };
  const inputValidateHandler = async (str) =>
    props.validate
      ? await props.validate(str, method.name, activeOptionDialCode)
      : undefined;

  useEffect(() => {
    if (props.change) {
      props.change(inputValue, method.name, activeOptionDialCode);
    }
    if (props.validate) {
      // input should be validated
      setTriggerInputValidate((prev) => prev + 1);
    }

    //clear input field
    setInputValue(defaultInputValue);
  }, [method, activeOptionDialCode]);

  const optionsJSX = options?.map((option, idx) => (
    <div
      key={option.code}
      data-code={option.code}
      className={
        option.code === activeOption
          ? styles.active
          : idx === currentOptionIdx
          ? styles.currentSelect
          : ""
      }
      onClick={() => submit(idx)}
    >
      <div>
        <span>{option.flag}</span>
        <p>
          {option.name} ({option.dial_code})
        </p>
      </div>
      <i className="fa-solid fa-check"></i>
    </div>
  ));

  return (
    <div className={styles.selectionWrapper}>
      {optionsOpen && props.methods.length > 1 && (
        <MethodPicker
          menuWidth={
            selectionWrapperRef?.current?.getBoundingClientRect().width
          }
          methods={props.methods}
          change={(newMethodName) =>
            setMethod(
              props.methods.find((method) => method.name === newMethodName)
            )
          }
        />
      )}
      <div className={styles.selectionInputWrapper}>
        <Menu
          optionsOpen={optionsOpen}
          customRef={selectionWrapperRef}
          optionsAvailable={optionsAvailable}
        >
          {optionsAvailable ? (
            <div className={styles.activeOption}>
              <span>{activeOptionFlag}</span>
              <span>{activeOptionDialCode}</span>
            </div>
          ) : (
            method.icon
          )}
        </Menu>
        <Input
          placeholder={method.name}
          style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          value={inputValue}
          {...(props.change && { change: inputChangeHandler })}
          {...(props.validate && { validate: inputValidateHandler })}
          triggerValidate={triggerInputValidate}
          errorMessages={errorMessages}
        />
      </div>
      <div
        className={styles.selectOptionsWrapper}
        style={{
          display: !optionsAvailable ? "none" : optionsOpen ? "block" : "none",
        }}
      >
        <Input
          placeholder="Suche nach Ländern"
          className={[styles.searchCountryInput]}
          customRef={searchCountryInputRef}
          change={searchCountryChangeHandler}
          value={searchCountryValue}
        />
        <section ref={selectOptionsRef} className={styles.optionsWrapper}>
          {optionsJSX}
        </section>
      </div>
    </div>
  );
}
