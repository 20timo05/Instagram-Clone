export function VolumeMeter(context) {
  this.context = context;
  this.volume = 0.0;
  this.script = context.createScriptProcessor(2048, 1, 1);
  const that = this;
  this.script.onaudioprocess = function (event) {
    // get volume at any time in the specified time interval (2048)
    const input = event.inputBuffer.getChannelData(0);

    // calculate mean volume
    var sum = 0.0;
    for (var i = 0; i < input.length; ++i) {
      sum += input[i] * input[i];
    }
    that.volume = Math.sqrt(sum / input.length);
  };
  this.connectToSource = function (stream, callback) {
    try {
      this.mic = this.context.createMediaStreamSource(stream);
      this.mic.connect(this.script);
      this.script.connect(this.context.destination);
      if (typeof callback !== "undefined") {
        callback(null);
      }
    } catch (e) {
      // what to do on error?
    }
  };

  this.stop = function () {
    this.mic.disconnect();
    this.script.disconnect();
  };
}

export default function handleMicroSuccess(stream, canvasRef, setAudioLength) {
  const audioContext = new AudioContext();

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const linesArr = [];
  let interval;
  let animationFrame;

  const volumeMeter = new VolumeMeter(audioContext);
  volumeMeter.connectToSource(stream, () => {
    interval = setInterval(() => {
      const volume = volumeMeter.volume.toFixed(2);
      linesArr.push({ volume, posX: 1 });
      if (setAudioLength) setAudioLength((prev) => prev + 1);
    }, 100);
  });

  function draw() {
    animationFrame = requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < linesArr.length; i++) {
      // remove lines if they are too far left (not visible anyway)
      if (linesArr[i].posX < 0) {
        linesArr.shift();
        i--;
        continue;
      }

      const MAX_VOLUME = 0.1;
      const MIN_LINE_HEIGHT = 5;
      const MAX_LINE_HEIGHT = 35;

      // map volume [0; 0.2] to line height [10; 35]
      const lineHeight =
        Math.min(linesArr[i].volume, MAX_VOLUME) *
          (1 / MAX_VOLUME) *
          (MAX_LINE_HEIGHT - MIN_LINE_HEIGHT) +
        MIN_LINE_HEIGHT;

      const x = linesArr[i].posX * canvas.width;
      const y = canvas.height * 0.5 - lineHeight * 0.5;

      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.roundRect(x, y, 5, lineHeight, [50]);
      ctx.fill();

      linesArr[i].posX -= 0.003;
    }
  }

  draw();

  return interval;
}
