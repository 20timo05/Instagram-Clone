import Head from "next/head"
import { useRef, useEffect } from "react";

import useWindowSize from "../../hooks/useWindowSize";

export default function AuthWrapper(props) {
  const { height } = useWindowSize();
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!height || !wrapperRef || !wrapperRef.current) return;
    wrapperRef.current.style.top = null;
    if (wrapperRef.current.getBoundingClientRect().top < 20) {
      wrapperRef.current.style.top = "20px";
    }
  }, [height, wrapperRef]);
  return (
    <>
      <Head>
        <title>Anmeldung • Instagram</title>
      </Head>
      <style jsx>{`
        .center {
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }

        .wrapper {
          position: absolute;
          top: auto;
          width: min(500px, 90vw);
          font-size: 1.5rem;
          padding: 3rem;
          border: 1px solid var(--grey);
          border-radius: 3px;
          text-align: center;
        }

        .wrapper > h1 {
          margin: 0 0 1em;
          font-size: 2em;
        }
      `}</style>
      <section className="center">
        <section ref={wrapperRef} className="wrapper">
          <h1>Instagram</h1>
          {props.children}
        </section>
      </section>
    </>
  );
}
