const imageInput = document.getElementById('imageInput');
const dotSizeSlider = document.getElementById('dotSizeSlider');
const styleSelector = document.getElementById('styleSelector');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let img = new Image();
let dotSize = parseInt(dotSizeSlider.value);
let style = styleSelector.value;
let scaledWidth, scaledHeight;

imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

img.onload = () => {
  scaleImageToScreen();
  applyHalftoneEffect();
};

dotSizeSlider.addEventListener('input', () => {
  dotSize = parseInt(dotSizeSlider.value);
  applyHalftoneEffect();
});

styleSelector.addEventListener('change', () => {
  style = styleSelector.value;
  applyHalftoneEffect();
});

function scaleImageToScreen() {
  const maxWidth = window.innerWidth * 0.8;
  const maxHeight = window.innerHeight * 0.8;
  const imgAspectRatio = img.width / img.height;

  if (img.width > maxWidth || img.height > maxHeight) {
    if (imgAspectRatio > 1) {
      scaledWidth = maxWidth;
      scaledHeight = maxWidth / imgAspectRatio;
    } else {
      scaledHeight = maxHeight;
      scaledWidth = maxHeight * imgAspectRatio;
    }
  } else {
    scaledWidth = img.width;
    scaledHeight = img.height;
  }

  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
}

function applyHalftoneEffect() {
  ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imgData;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < height; y += dotSize) {
    for (let x = 0; x < width; x += dotSize) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const grayscale = (r + g + b) / 3;

      ctx.fillStyle = '#000';
      drawStyle(x, y, grayscale);
    }
  }
}

function drawStyle(x, y, grayscale) {
  const size = (dotSize / 2) * (1 - grayscale / 255);
  const angle = Math.random() * Math.PI * 2;

  switch (style) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'square':
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
      break;
    case 'triangle':
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(-size, size);
      ctx.lineTo(size, size);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    case 'ascii':
      ctx.font = `${size * 2}px Monospace`;
      ctx.fillText('@', x - size / 2, y + size / 2);
      break;
    case 'emoji':
      ctx.font = `${size * 2}px sans-serif`;
      ctx.fillText('😀', x - size / 2, y + size / 2);
      break;
  }
}
