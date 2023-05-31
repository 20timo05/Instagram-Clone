import { forwardRef } from "react";

// straight from instagram
import emojis from "../../database/emojis.json";

const EmoticonMenu = forwardRef(({ addEmoji, style }, ref) => (
  <>
    <style jsx>{`
      .wrapper {
        position: absolute;
        translate: calc(-1rem - 10px) calc(-50% - 2rem);
        height: 400px;
        width: 400px;
        background: white;
        border-radius: 5px;
        box-shadow: var(--boxShadow);
        padding-left: 1rem;
        max-width: 80vw;
        z-index: 5;
      }

      .list {
        height: 100%;
        width: 100%;
        overflow-x: hidden;
        overflow-y: auto;
      }

      .wrapper::after {
        content: "";
        display: block;
        height: 0;
        width: 0;
        position: absolute;
        bottom: 0;
        translate: 0 100%;
        border-left: 20px solid transparent;
        border-right: 20px solid transparent;
        border-top: 20px solid white;
      }

      .heading {
        font-size: 1rem;
        color: var(--darkGrey);
        margin: 1rem 0;
      }

      .emoticonWrapper {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(7, 1fr);
      }

      .emoticon {
        font-size: min(36px, 6vw);
        cursor: pointer;
        min-width: 0;
        text-align: center;
      }
    `}</style>
    <section ref={ref} className="wrapper" style={style}>
      <div className="list">
        {emojis.map((emoji) => (
          <span key={emoji.heading}>
            <h3 className="heading">{emoji.heading}</h3>
            <div className="emoticonWrapper">
              {emoji.emoticons.map((emoticon) => (
                <span
                  key={emoticon}
                  className="emoticon"
                  onClick={() => addEmoji(emoticon)}
                >
                  {emoticon}
                </span>
              ))}
            </div>
          </span>
        ))}
      </div>
    </section>
  </>
));

EmoticonMenu.displayName = "EmoticonMenu";
export default EmoticonMenu;
