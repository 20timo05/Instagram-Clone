export default function createInnerShadow(canvas, img, distance, alpha) {
  //the size of the shadow depends on the size of the target,
  //then I will create extra "walls" around the picture to be sure
  //tbat the shadow will be correctly filled (with the same intensity everywhere)
  //(it's not obvious with this image, but it is when there is no space at all between the image and its border)
  var offset = 50 + distance;
  var hole = document.createElement("canvas");
  var holeContext = hole.getContext("2d");
  hole.width = img.width + offset * 2;
  hole.height = img.height + offset * 2;

  //first, I draw a big black rect
  holeContext.fillStyle = "#000000";
  holeContext.fillRect(0, 0, hole.width, hole.height);

  //then I use the image to make an hole in it
  holeContext.globalCompositeOperation = "destination-out";
  holeContext.drawImage(img, offset, offset);

  //I create a new canvas that will contains the shadow of the hole only
  var shadow = document.createElement("canvas");
  var shadowContext = shadow.getContext("2d");
  shadow.width = img.width;
  shadow.height = img.height;
  shadowContext.filter = "drop-shadow(0px 0px " + distance + "px #000000 ) ";
  shadowContext.drawImage(hole, -offset, -offset);
  shadowContext.globalCompositeOperation = "destination-out";
  shadowContext.drawImage(hole, -offset, -offset);

  //now, because the default-shadow filter is really to soft, I normalize the shadow
  //then I will be sure that the alpha-gradient of the shadow will start at "alpha" and end at 0
  normalizeAlphaShadow(shadow, alpha);

  //Finally, I create another canvas that will contain the image and the shadow over it
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ctx.drawImage(shadow, 0, 0);
}

function normalizeAlphaShadow(canvas, alpha) {
  var imageData = canvas
    .getContext("2d")
    .getImageData(0, 0, canvas.width, canvas.height);
  var pixelData = imageData.data;
  var i,
    len = pixelData.length;
  var max = 0;
  for (i = 3; i < len; i += 4) if (pixelData[i] > max) max = pixelData[i];

  max = (255 / max) * alpha;
  for (i = 3; i < len; i += 4) pixelData[i] *= max;

  canvas.getContext("2d").putImageData(imageData, 0, 0);
}
