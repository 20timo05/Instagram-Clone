import styles from "./style.module.css";

export default function MethodPicker(props) {
  return (
    <>
      <style jsx>{`
        .left {
          left: ${props.menuWidth / 2}px;
        }
      `}</style>
      <section className={`${styles.methodPicker} left`} style={props.style}>
        {props.methods.map((method, idx) => (
          <span
            key={`${idx}${method.name}`}
            onClick={() => props.change(method.name)}
          >
            {method.icon}
          </span>
        ))}
      </section>
    </>
  );
}
