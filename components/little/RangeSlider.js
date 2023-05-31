import { useState } from "react";

export default function RangeSlider({ value, onChange }) {
  const [defaultValue, setDefaultValue] = useState(value);

  return (
    <>
      <style jsx>{`
        .wrapper {
          width: 100%;
          position: relative;
        }

        .slider {
          -webkit-appearance: none;
          width: 100%;
          height: 2px;
          background: var(--lightGrey);
          border-radius: 5px;
          outline: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
        }

        .slider::-webkit-slider-thumb,
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: black;
          cursor: pointer;
        }

        .wrapper::after {
          content: "";
          height: 2px;
          width: ${Math.abs(defaultValue - value)}%;
          position: absolute;
          left: ${Math.min(defaultValue, value)}%;
          top: 50%;
          transform: translateY(50%);
          background: black;
        }
      `}</style>
      <div className="wrapper">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(evt) => onChange(evt.target.value)}
          className="slider"
        ></input>
      </div>
    </>
  );
}
