import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function PostPreview(props) {
  const { post, username, ...otherProps } = props;
  const [mouseOver, setMouseOver] = useState(false);

  return (
    <>
      <style jsx>{`
        .wrapper {
          position: relative;
        }

        .overlay {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          justify-content: space-around;
          align-items: center;
          color: white;
          padding: 0 20px;
          font-size: 1.2rem;
        }

        .overlay > span > i {
          margin-right: 5px;
        }

        .svg {
          position: absolute;
          top: 5px;
          right: 5px;
          height: 22px;
        }
      `}</style>
      <Link href={`/${username}/${post.id}`}>
        <div
          onMouseOver={() => setMouseOver(true)}
          onMouseLeave={() => setMouseOver(false)}
          className="wrapper"
        >
          <Image
            src={post?.photos[0]?.image_url}
            style={{ objectFit: "cover" }}
            alt="Photo"
            fill
            sizes={`(max-width: 940px) 33vw,
                          300px
                          `}
            {...otherProps}
          />
          {post.photos.length > 1 && (
            <div className="svg">
              <Image
                src="/iconsStraightFromInstagram/MultiplePhotosIcon.svg"
                alt=""
                fill
                draggable={false}
              />
            </div>
          )}
          {mouseOver && (
            <section className="overlay">
              {!!post.allowLikes && (
                <span>
                  <i className="fa-solid fa-heart"></i> {post.likeCount}
                </span>
              )}
              {!!post.allowComments && (
                <span>
                  <i className="fa-solid fa-comment"></i> {post.commentCount}
                </span>
              )}
            </section>
          )}
        </div>
      </Link>
    </>
  );
}
