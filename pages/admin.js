import { signOut } from "next-auth/react";

import { fetchData } from "../hooks/useFetch";

export default function AdminPage() {
  const regenerateImagesHandler = async () => {
    const { ok, data, error } = await fetchData("GET", "/api/faker/photos");
    console.log(ok ? data : error);
  };

  const regenerateProfilePicturesHandler = async () => {
    const { ok, data, error } = await fetchData(
      "GET",
      "/api/faker/profilePictures"
    );
    console.log(ok ? data : error);
  };

  const followHandler = async (evt) => {
    evt.preventDefault();

    const userToFollow = evt.target[0].value;
    const { userId } = await fetchData("GET", `/api/user/getUser`, {
      username: userToFollow,
    });

    const { ok, data, error } = await fetchData(
      "POST",
      "/api/user/setFollow/",
      {
        followId: userId,
        followStatus: true,
      }
    );
    console.log(ok ? data : error);
  };

  const getFollowsHandler = async (evt) => {
    evt.preventDefault();

    const userGetFollows = evt.target[0].value;
    const { data } = await fetchData("GET", `/api/user/getUser`, {
      username: userGetFollows,
    });

    const { data: followsData } = await fetchData(
      "GET"`/api/user/getFollows/`,
      { userId: data.id }
    );
    console.log(followsData);
  };

  const test = async () => {
    /* const formData = new FormData();
    formData.append("currentLoggedInUserId", "101");

    const img = new Image();
    img.src = "/post_photos/Alec82/208_0.jpg";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const url = canvas.toBlob(async (blob) => {
        const file = new File([blob], "test.jpg");
        formData.append("img1", file);
        formData.append("img2", file);
        formData.append("img3", file);

        await fetch("/api/posts/createPostPhoto", {
          method: "POST",
          body: formData,
        });
      }, "image/jpg");
    }; */
    const { ok, data, error } = await fetchData(
      "GET",
      "/api/faker/downloadProfilePictures"
    );
    console.log(ok ? data : error);
  };

  const logOutHandler = async () => {
    await signOut();
  };

  return (
    <>
      <style jsx>{`
        section {
          position: absolute;
          top: 50%;
          left: 50%;
          translate: -50% -50%;
          box-shadow: rgb(38, 57, 77) 0px 20px 30px -10px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scale: 2;
        }
      `}</style>
      <section>
        <h1>Admin Control Panel</h1>
        <button onClick={regenerateImagesHandler}>Regenerate Images</button>
        <button onClick={regenerateProfilePicturesHandler}>
          Regenerate Profile Pictures
        </button>
        <form onSubmit={followHandler}>
          <input type="text" placeholder="username" />
          <button type="submit">Follow</button>
        </form>
        <form onSubmit={getFollowsHandler}>
          <input type="text" placeholder="username" />
          <button type="submit">Get Follows</button>
        </form>
        <button onClick={test}>Test</button>
        <button onClick={logOutHandler}>Sign Out</button>
      </section>
    </>
  );
}
