import styles from "./style.module.css";

export default function Menu(props) {
  const { children, optionsOpen, customRef, optionsAvailable } = props;
  return (
    <section className={styles.select} ref={customRef}>
      {children}
      <i
        {...(!optionsAvailable && {
          style: { visibility: "hidden", width: "0" },
        })}
        className={`fa-solid fa-chevron-down ${
          optionsOpen ? styles.optionsOpen : ""
        }`}
      ></i>
    </section>
  );
}
