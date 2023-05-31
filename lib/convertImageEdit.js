import createInnerShadow from "./vignetteEffectCanvas";

// this function takes the images which were edited along with all the different edits made to the image and converts it to a base64 png image which can be stored in the database

export default async function convertImageEdit(imageSliderImgs) {
  const convertedImgs = await Promise.all(
    imageSliderImgs.map(async (imgObj) => {
      let img = await loadImage(imgObj.image_url);

      // vignette filter
      if (imgObj.vignette) {
        const canvas = document.createElement("canvas");
        createInnerShadow(canvas, img, imgObj.vignette, 1);
        img = await loadImage(canvas.toDataURL());
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = 650;
      canvas.height = 650;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // draw img like objectFit: contain
      const defaultScale = 650 / Math.max(img.width, img.height);
      const newScale = defaultScale * imgObj.scale;
      const newWidth = img.width * newScale;
      const newHeight = img.height * newScale;

      const newPosXMiddle = 325 + imgObj.offsetX;
      const newPosYMiddle = 325 + imgObj.offsetY;

      const newPosX = newPosXMiddle - newWidth / 2;
      const newPosY = newPosYMiddle - newHeight / 2;

      // add filters
      let filter = "";
      if (imgObj.brightness !== 1) filter += `brightness(${imgObj.brightness})`;
      if (imgObj.contrast !== 1) filter += `contrast(${imgObj.contrast})`;
      if (imgObj.sepia) filter += `sepia(${imgObj.sepia})`;
      if (imgObj.blur) filter += `blur(${imgObj.blur}px)`;
      ctx.filter = filter;

      ctx.drawImage(img, newPosX, newPosY, newWidth, newHeight);

      return { id: imgObj.position, src: canvas.toDataURL() };
    })
  );

  return convertedImgs;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // to avoid CORS if used with Canvas
    img.src = src;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (e) => {
      reject(e);
    };
  });
}
