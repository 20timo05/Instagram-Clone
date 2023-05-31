import { useState, useEffect } from "react";

import ToggleSwitch from "../little/ToggleSwitch";
import RangeSlider from "../little/RangeSlider";

export default function EditImageOption(props) {
  const { label, sliderChange, switchChange } = props;

  const [switchValue, setSwitchValue] = useState(false);
  const [sliderValue, setSliderValue] = useState(props.defaultSliderValue);

  useEffect(() => {
    if (props.value !== undefined) setSliderValue(props.value);
  }, [props.value]);
  useEffect(() => {
    if (props.switchValue !== undefined) setSwitchValue(props.switchValue);
  }, [props.switchValue]);

  const sliderChangeHandler = (val) => {
    setSliderValue(val);
    sliderChange(val);
  };

  const switchChangeHandler = async (checked) => {
    setSwitchValue(checked);
    const newSliderValue = await switchChange(checked);
    if (newSliderValue) setSliderValue(newSliderValue);
  };

  return (
    <>
      <style jsx>{`
        .wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
          position: relative;
        }

        .wrapper {
          align-items: flex-start;
          max-width: min(800px, calc(100vw - 2rem));
        }

        .wrapper > label {
          font-size: 1.5rem;
        }

        .wrapper > span {
          width: 100%;
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .wrapper > span > span {
          opacity: 0.5;
        }

        .reset {
          position: absolute;
          top: 5px;
          right: 5px;
          font-weight: bolder;
          color: var(--blue);
          cursor: pointer;
          opacity: 0;
          transition: 0.1s ease-in-out;
        }

        .wrapper:hover > .reset.visible {
          opacity: 1;
        }
      `}</style>
      <div className="wrapper">
        <label>{label}</label>
        <span>
          {switchChange && (
            <ToggleSwitch value={switchValue} onChange={switchChangeHandler} />
          )}
          <RangeSlider value={sliderValue} onChange={sliderChangeHandler} />
          <span>{Math.round(sliderValue - props.defaultSliderValue)}</span>
        </span>
        <div
          className={`reset ${
            parseInt(sliderValue) !== props.defaultSliderValue ? "visible" : ""
          }`}
          onClick={() => sliderChangeHandler(props.defaultSliderValue)}
        >
          Zurücksetzen
        </div>
      </div>
    </>
  );
}
