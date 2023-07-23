import Image from "next/image";

export default function ProfileImage(props) {
  const { username, src, style, ...otherProps } = props;
  
  return (
    <>
      <Image
        unoptimized
        style={{ borderRadius: "50%", objectFit: "cover", ...style }}
        src={
          src
            ? src
            : username
            ? `/api/getFiles/getProfileImage?username=${username}`
            : "/default_profile_image.jpg"
        }
        alt="Profile Picture"
        {...otherProps}
      />
    </>
  );
}
