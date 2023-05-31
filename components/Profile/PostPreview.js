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
            <svg
              className="svg"
              color="#ffffff"
              fill="#ffffff"
              height="22"
              width="20"
              role="img"
              viewBox="0 0 48 48"
            >
              <path d="M34.8 29.7V11c0-2.9-2.3-5.2-5.2-5.2H11c-2.9 0-5.2 2.3-5.2 5.2v18.7c0 2.9 2.3 5.2 5.2 5.2h18.7c2.8-.1 5.1-2.4 5.1-5.2zM39.2 15v16.1c0 4.5-3.7 8.2-8.2 8.2H14.9c-.6 0-.9.7-.5 1.1 1 1.1 2.4 1.8 4.1 1.8h13.4c5.7 0 10.3-4.6 10.3-10.3V18.5c0-1.6-.7-3.1-1.8-4.1-.5-.4-1.2 0-1.2.6z"></path>
            </svg>
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
