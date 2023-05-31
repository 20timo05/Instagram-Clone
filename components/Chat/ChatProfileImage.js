import ProfileImage from "../little/ProfileImage";

export default function ChatProfileImage({ users }) {
  if (users.length === 1) {
    return (
      <div>
        <ProfileImage username={users[0]} height={60} width={60} />
      </div>
    );
  }

  const styles = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-70%, -70%)",
  };

  return (
    <>
      <style jsx>{`
        .wrapper {
          height: 60px;
          width: 60px;
          position: relative;
        }
      `}</style>
      <div className="wrapper">
        <ProfileImage
          username={users[0]}
          height={40}
          width={40}
          style={styles}
        />
        <ProfileImage
          username={users[1]}
          height={40}
          width={40}
          style={{
            ...styles,
            transform: "translate(-30%, -30%)",
            outline: "3px solid var(--darkWhite)",
          }}
        />
      </div>
    </>
  );
}
