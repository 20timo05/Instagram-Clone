import styles from "./authSignup/auth.module.css";

export default function Footer(props) {
  const { spacer = true } = props;

  return (
    <>
      {spacer && <div className={styles.spacer}>{props.children}</div>}
      <footer className={styles.footer}>{props.children}</footer>
    </>
  );
}
