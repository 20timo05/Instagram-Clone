import { useState, useEffect } from "react";

import styles from "./createPostPage.module.css";
import UploadImage from "./UploadImage";
import EditImage from "./EditImage";
import SetCaption from "./SetCaption";

export default function CreatePostPage(props) {
  const [createPostState, setCreatePostState] = useState("upload");

  const [imgObj, setImgObj] = useState([]);
  const [editedImgObj, setEditedImgObj] = useState([]);

  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState({});
  const [allowLikes, setAllowLikes] = useState(true);
  const [allowComments, setAllowComments] = useState(true);

  function next(editedImgObj) {
    setEditedImgObj(
      editedImgObj.map((img) => ({
        id: img.id,
        src: img.src,
        alternativeText: "",
        peopleTags: [],
      }))
    );
    setCreatePostState("caption");
  }

  useEffect(() => {
    if (imgObj.length > 0) setCreatePostState("edit");
  }, [imgObj]);

  const submitHandler = async () => {
    if (!caption) return;

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        caption,
        allowLikes,
        allowComments,
        location,
        imgData: editedImgObj.map((img) => ({
          id: img.id,
          alternativeText: img.alternativeText,
          peopleTags: img.peopleTags,
        })),
      })
    );

    // attach images to formData
    for (let i = 0; i < editedImgObj.length; i++) {
      const imgFile = await imageSrcToFile(editedImgObj[i].src);
      formData.append(editedImgObj[i].id, imgFile);
    }

    await fetch("/api/posts/createPost", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div className={styles.wrapper}>
      <header>
        <h1>Neuen Beitrag erstellen</h1>
      </header>
      {createPostState === "upload" ? (
        <UploadImage setImgObj={setImgObj} />
      ) : createPostState === "edit" ? (
        <EditImage
          imgObj={imgObj}
          next={next}
          back={() => setCreatePostState("upload")}
        />
      ) : (
        <SetCaption
          imgObj={editedImgObj}
          setImgObj={setEditedImgObj}
          caption={caption}
          setCaption={setCaption}
          location={location}
          setLocation={setLocation}
          setAllowLikes={setAllowLikes}
          setAllowComments={setAllowComments}
          submit={submitHandler}
          back={() => setCreatePostState("edit")}
          {...props}
        />
      )}
    </div>
  );
}

function imageSrcToFile(imgSrc) {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      img.src = imgSrc;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const url = canvas.toBlob(async (blob) => {
          const file = new File([blob], "test.jpg");
          resolve(file);
        }, "image/jpg");
      };
    } catch (err) {
      reject(err);
    }
  });
}
