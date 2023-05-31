export default function Dropdown(props) {
  const { name, options, ...selectProps } = props;

  return (
    <>
      <style jsx>{`
        select {
          border: 1px solid var(--lightGrey);
          border-radius: 5px;
          padding: 10px 0 10px 20px;
          background: none;
        }
      `}</style>
      <select name={name} {...selectProps}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  );
}
