import { useState } from "react";

export default function OptionsSlider(props) {
  const [optionIdx, setOptionIdx] = useState(0);

  return (
    <>
      <style jsx>{`
        .wrapper {
          width: 100%;
          display: flex;
          border-bottom: 1px solid var(--lightGrey);
          position: relative;
          cursor: pointer;
        }

        .wrapper > div {
          width: 100%;
          height: 100%;
          padding: 1rem 0;
          text-align: center;
        }

        .wrapper::after {
          content: "";
          height: 2px;
          width: calc(100% / ${props.options.length});
          background: var(--black);
          position: absolute;
          bottom: 0;
          left: 0;
          transition: 0.2s ease-in-out;
        }

        .wrapper::after {
          translate: calc(${optionIdx} * 100%);
        }
      `}</style>
      <header className="wrapper">
        {props.options.map((option, idx) => (
          <div
            key={idx}
            onClick={() => {
              setOptionIdx(idx);
              props.onClick([option, idx]);
            }}
          >
            {option}
          </div>
        ))}
      </header>
    </>
  );
}
