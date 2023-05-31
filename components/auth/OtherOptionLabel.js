export default function OtherOptionLabel() {
  return (
    <>
      <style jsx>{`
        section {
          width: 100%;
          color: var(--darkGrey);
          margin: 20px 0;
          display: flex;
          flex-direction: row;
          align-items: center;
        }

        section > span {
          margin: 0 20px;
        }

        .line {
          height: 1px;
          width: 100%;
          background: var(--darkGrey);
        }
      `}</style>
      <section>
        <div className="line"></div>
        <span>ODER</span>
        <div className="line"></div>
      </section>
    </>
  );
}
