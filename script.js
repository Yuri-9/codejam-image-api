/* eslint-disable func-names */
/* eslint-disable no-return-assign */
/* eslint-disable no-plusplus */

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let isDrawing = false;
let canvasSize = 128;
canvas.width = canvasSize;
canvas.height = canvasSize;
let squireX = 0;
let squireY = 0;
const pixelSize = 512 / canvasSize;
const scaleNumber = 512 / pixelSize;
let img3;


let colorGlobal;
let prevColor;
colorGlobal = localStorage.getItem('colorSocket1');
prevColor = localStorage.getItem('colorSocket2');
canvasSize = localStorage.getItem('canvasSizeSocket');

// eslint-disable-next-line eqeqeq
if (colorGlobal == undefined) {
  colorGlobal = '#ff0000';
  prevColor = '#00ff40';
  canvasSize = 128;
}

if (+canvasSize === 128) {
  document.querySelector('#btnSize128').classList.add('clickBtn');
}
if (+canvasSize === 256) {
  document.querySelector('#btnSize256').classList.add('clickBtn');
}
if (+canvasSize === 512) {
  document.querySelector('#btnSize512').classList.add('clickBtn');
}

document.querySelector('#red').style.backgroundColor = '#ff0000';
document.querySelector('#blue').style.backgroundColor = '#0000ff';
document.querySelector('#current_color').style.backgroundColor = colorGlobal;
document.querySelector('#prev_color').style.backgroundColor = prevColor;

function saveCanvas() {
  localStorage.setItem(canvas, canvas.toDataURL());
  localStorage.setItem('colorSocket1', colorGlobal);
  localStorage.setItem('colorSocket2', prevColor);
  localStorage.setItem('canvasSizeSocket', canvasSize);
}

function drawImageOnCanvas(imgFn) {
  if (imgFn.width === 0) return;
  const imgW = imgFn.width;
  const imgH = imgFn.height;
  const canW = canvas.width;
  let minSideImg;
  if (imgW > imgH) {
    minSideImg = ((canW * imgH) / imgW);
    ctx.drawImage(imgFn, 0, ((canW - minSideImg) / 2), canW, minSideImg);
    saveCanvas();
  } else {
    minSideImg = ((canW * imgW) / imgH);
    ctx.drawImage(imgFn, ((canW - minSideImg) / 2), 0, minSideImg, canW);
    saveCanvas();
  }
}

const dataURL = localStorage.getItem(canvas);
const img2 = new Image();
img2.src = dataURL;
img2.onload = function () {
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  drawImageOnCanvas(img2);
};

function chooseTools(event) {
  const chooseToolEL = event.target.classList;
  document.querySelector('.menu_tools .clickBtn').classList.remove('clickBtn');
  chooseToolEL.add('clickBtn');
}

function chooseToolsKeyboard(event) {
  if (event.code === 'KeyF') {
    document.querySelector('.menu_tools .clickBtn').classList.remove('clickBtn');
    document.querySelector('.menu_tools--btn_fill_bucket').classList.add('clickBtn');
  }
  if (event.code === 'KeyC') {
    document.querySelector('.menu_tools .clickBtn').classList.remove('clickBtn');
    document.querySelector('.menu_tools--btn_choose_color').classList.add('clickBtn');
  }
  if (event.code === 'KeyP') {
    document.querySelector('.menu_tools .clickBtn').classList.remove('clickBtn');
    document.querySelector('.menu_tools--btn_pencil').classList.add('clickBtn');
  }
}

function chooseColor(event) {
  window.oninput = function oninputColor() {
    prevColor = document.querySelector('#current_color').style.backgroundColor;
    document.querySelector('#prev_color').style.backgroundColor = prevColor;
    const inputColor = document.getElementById('current_color_input').value;
    document.querySelector('#current_color').style.backgroundColor = inputColor;
    colorGlobal = inputColor;
    localStorage.setItem('colorSocket1', colorGlobal);
    localStorage.setItem('colorSocket2', prevColor);
  };

  const colorEv = event.target;
  if (colorEv.tagName === 'DIV') return;
  document.querySelector('.menu_color .clickBtn').classList.remove('clickBtn');
  colorEv.classList.add('clickBtn');
  colorGlobal = colorEv.previousElementSibling.style.backgroundColor;
  saveCanvas();
}

function chooseSize(event) {
  document.querySelector('.menu_size .clickBtn').classList.remove('clickBtn');
  event.target.classList.add('clickBtn');
  let strCanvasSize = event.target.innerText;
  strCanvasSize = strCanvasSize.slice(0, 3);
  canvasSize = +strCanvasSize;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  if (img3 !== undefined) {
    drawImageOnCanvas(img3);
  } else {
    drawImageOnCanvas(img2);
  }
}

function drawPencil(event) {
  if (document.querySelector('.menu_tools--btn_pencil').classList.length !== 3) return;
  if (!isDrawing) return;
  squireX = Math.trunc((event.offsetX / 512) * canvasSize);
  squireY = Math.trunc((event.offsetY / 512) * canvasSize);
  ctx.fillStyle = colorGlobal;
  ctx.fillRect(squireX, squireY, 1, 1);
  saveCanvas();
}

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

function fillColor(event) {
  if (document.querySelector('.menu_tools--btn_fill_bucket').classList.length !== 3) return;
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  const xEl = event.offsetX;
  const yEl = event.offsetY;
  const rgbaEl = ctx.getImageData(xEl, yEl, 1, 1).data;
  let rgbaStringEl = `rgb(${rgbaEl[0]}, ${rgbaEl[1]}, ${rgbaEl[2]})`;
  let colorGlobalRbg;
  if (rgbaStringEl === 'rgb(0,0,0)' && (colorGlobal[0] === '#')) {
    rgbaStringEl = 'rgb(255,255,255)';
    colorGlobalRbg = hexToRGB(colorGlobal);
  } else {
    colorGlobalRbg = colorGlobal;
  }
  if (rgbaStringEl !== colorGlobalRbg) {
    const fillArea = function fillArea() {
      for (let x = 0; x < pixelSize; x++) {
        for (let y = 0; y < pixelSize; y++) {
          const pixelCanvasColor = ctx.getImageData((x * scaleNumber + 1),
            (y * scaleNumber + 1), 1, 1).data;
          const pixelCanvasColorRgb = `rgb(${pixelCanvasColor[0]}, ${pixelCanvasColor[1]}, ${pixelCanvasColor[2]})`;
          if (pixelCanvasColorRgb === rgbaStringEl) {
            ctx.fillStyle = colorGlobal;
            ctx.fillRect(x * scaleNumber, y * scaleNumber, scaleNumber, scaleNumber);
          }
        }
      }
    };

    fillArea();
  }
}

function chooseColor2(event) {
  if (document.querySelector('.menu_tools--btn_choose_color').classList.length !== 3) return;
  const x = Math.trunc((event.offsetX / 512) * canvasSize);
  const y = Math.trunc((event.offsetY / 512) * canvasSize);
  const pixel = ctx.getImageData(x, y, 1, 1);
  const data1 = pixel.data;
  const rgba = `rgba(${data1[0]}, ${data1[1]}, ${data1[2]}, ${data1[3] / 255})`;
  document.querySelector('#current_color').style.backgroundColor = rgba;
  colorGlobal = rgba;
  saveCanvas();
}
async function loadImage() {
  const link1 = 'https://api.unsplash.com/photos/random?query=town,';
  const link2 = '&client_id=7b76a47280b1e328889c12e58cfac9f74a7b39257fe1b4d8a8a4ddb681e74211';
  const valueInput = document.querySelector('#input').value;
  const link = link1 + valueInput + link2;

  await fetch(link).then((res) => res.json()).then((data) => {
    const img = new Image();
    img.src = data.urls.small;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      drawImageOnCanvas(img);
      img3 = img;
    };
  });
}


document.querySelector('#load').onclick = loadImage;

canvas.addEventListener('mousedown', chooseColor2);

canvas.addEventListener('mousemove', drawPencil);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mousedown', () => isDrawing = true);

document.querySelector('.menu_tools').addEventListener('mousedown', chooseTools);
document.querySelector('.menu_color').addEventListener('mousedown', chooseColor);
document.querySelector('.menu_size').addEventListener('mousedown', chooseSize);
document.addEventListener('keydown', chooseToolsKeyboard);

canvas.addEventListener('mousedown', fillColor);
