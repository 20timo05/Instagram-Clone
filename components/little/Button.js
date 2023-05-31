export default function Button(props) {
  const { value, submit, className, ...buttonProps } = props;

  const { disabled = false } = buttonProps;

  return (
    <>
      <style jsx>{`
        button {
          width: 100%;
          padding: 10px;
          border: none;
          background: var(--blue);
          border-radius: 5px;
          color: white;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.7em;
        }

        button:active {
          opacity: 0.5;
        }

        button.disabled {
          opacity: 0.5;
          cursor: default;
        }
      `}</style>
      <button
        className={`${disabled ? "disabled" : ""} ${
          className ? className : ""
        }`}
        {...buttonProps}
      >
        {value}
      </button>
    </>
  );
}
