import Image from "next/image";

export default function OtherOption(props) {
  const { option, onClick } = props;
  

  return <>
    <style jsx>{`
      div {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 10px;
        padding-left: 20px;
        margin: 20px 0;
        border: 1px solid var(--lightGrey);
        box-shadow: 0 2px 2px 0 rgba(28,29,31,.24),0 0 2px 0 rgba(28,29,31,.12);
        cursor: pointer;
      }

      div:hover {
        background: var(--lighterGrey);
      }

      div > span {
        margin-left: 10px;
      }
    `}</style>
    <div onClick={onClick}>
      <Image src={`/icons/${option}.svg`} width="25" height="25" />
      <span>Mit <b>{option}</b> anmelden</span>
    </div>
  </>;
}
