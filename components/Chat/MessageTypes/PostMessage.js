import Image from "next/image";
import Link from "next/link";

import LoadingAnimation from "../../little/LoadingAnimation";
import ProfileImage from "../../little/ProfileImage";

import useFetch from "../../../hooks/useFetch";

export default function PostMessage(props) {
  const [data, setData, loading, error] = useFetch(
    "GET",
    "api/posts/getChatMessagePostData",
    { postId: props.postId }
  );

  return (
    <>
      <style jsx>{`
        div {
          border: 1px solid var(--lightGrey);
          border-radius: 20px;
          padding: 0.5rem 0;
          width: 300px;
          max-width: 80%;
        }

        div.right {
          background: var(--lightGrey);
        }

        header {
          display: flex;
          gap: min(1rem, 0.75vw);
          align-items: center;
          font-weight: bolder;
          padding: 0 0.5rem 0.5rem;
          cursor: pointer;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: min(1rem, 2.5vw);
        }

        section {
          position: relative;
          aspect-ratio: 300 / 375;
          cursor: pointer;
        }

        footer {
          font-weight: bolder;
          max-width: 300px;
          padding: 0.5rem 0.5rem 0;
          font-size: 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .svg {
          position: absolute;
          top: 5px;
          right: 5px;
          height: 22px;
          width: 20px;
          display: grid;
          place-items: center;
        }
      `}</style>
      {loading ? (
        <LoadingAnimation />
      ) : (
        <div className={props.ownMessage && "right"}>
          <Link href={`/${data.username}`}>
            <header>
              <ProfileImage
                username={data.username}
                height={40}
                width={40}
                style={{
                  transform: `scale(${props.scale || 1})`,
                  transformOrigin: "left center",
                }}
              />
              {data.username}
            </header>
          </Link>
          <Link href={`/${data.username}/${data.id}`}>
            <section>
              <Image
                src={data.image_url}
                alt={data.alternativeText}
                fill
                sizes="(min-width: 800px) 300px"
                style={{ objectFit: "cover" }}
              />
              {data.photo_count > 1 && (
                <span className="svg">
                  <Image
                    src="/iconsStraightFromInstagram/MultiplePhotosIcon.svg"
                    alt=""
                    fill
                    draggable={false}
                  />
                </span>
              )}
            </section>
          </Link>
          <footer>{data.caption}</footer>
        </div>
      )}
    </>
  );
}
