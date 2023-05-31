import Image from "next/image";

export default function ProfileImage(props) {
  const { username, src, style, ...otherProps } = props;

  return (
    <>
      <Image
        style={{ borderRadius: "50%", objectFit: "cover", ...style }}
        src={
          src
            ? src
            : username
            ? `/api/image/profile_images/${username}.jpg`
            : "/default_profile_image.jpg"
        }
        alt="Profile Picture"
        {...otherProps}
      />
    </>
  );
}
