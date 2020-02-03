const RED_COLOR = '#ff0000';
const GREEN_COLOR = '#00ff40';
const BLUE_COLOR = '#0000ff';
const YELLOW_COLOR = '#ffff00';
const SIZE_CANVAS_CSS = 512;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let x = 0;
let y = 0;
let isDrawing = false;
let canvasSize = +localStorage.getItem('canvasSize') || 128;
canvas.width = canvasSize;
canvas.height = canvasSize;
let toolSelected = 'pencil';
const keyTool = {
  KeyF: 'bucket',
  KeyC: 'picker',
  KeyP: 'pencil',
};
const colors = {
  currentColor: localStorage.getItem('currentColor') || GREEN_COLOR,
  prevColor: localStorage.getItem('prevColor') || YELLOW_COLOR,
  redColor: RED_COLOR,
  blueColor: BLUE_COLOR,
};
let colorSelected = colors.currentColor;


(function renderLocalStorage() {
  document.getElementById(`buttonCanvasSize${canvasSize}`).classList.add('selected');
  document.getElementById('currentColorBackground').style.background = colors.currentColor;
  document.getElementById('prevColorBackground').style.background = colors.prevColor;
  document.getElementById('redColorBackground').style.background = RED_COLOR;
  document.getElementById('blueColorBackground').style.background = BLUE_COLOR;

  const image = new Image();
  image.src = localStorage.getItem('canvas');
  image.onload = () => {
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    ctx.drawImage(image, 0, 0, canvasSize, canvasSize);
  };
}());

function saveSession() {
  localStorage.setItem('canvas', canvas.toDataURL());
  localStorage.setItem('currentColor', colors.currentColor);
  localStorage.setItem('prevColor', colors.prevColor);
  localStorage.setItem('canvasSize', canvasSize);
}

function drawImageOnCanvas(image) {
  if (image.width === 0) return;
  const { width, height } = image;
  const { width: canvasWidth } = canvas;
  if (width > height) {
    const minSideImage = ((canvasWidth * height) / width);
    ctx.drawImage(image, 0, ((canvasWidth - minSideImage) / 2), canvasWidth, minSideImage);
  } else {
    const minSideImage = ((canvasWidth * width) / height);
    ctx.drawImage(image, ((canvasWidth - minSideImage) / 2), 0, minSideImage, canvasWidth);
  }
}

function removeClassSelected(className) {
  const arrayElements = document.querySelectorAll(className);
  arrayElements.forEach((item) => item.classList.remove('selected'));
}

function setTools({ target }) {
  const elementTool = target.classList;
  removeClassSelected('.menu_tools--item');
  elementTool.add('selected');
  toolSelected = target.id;
}

function setToolsKeyboard(event) {
  if (keyTool[event.code]) {
    removeClassSelected('.menu_tools--item');
    toolSelected = keyTool[event.code];
    document.getElementById(keyTool[event.code]).classList.add('selected');
  }
}

function getInputColor({ target }) {
  const { value } = target;
  colors.prevColor = colors.currentColor;
  colors.currentColor = value;

  document.getElementById('currentColorBackground').style.background = colors.currentColor;
  document.getElementById('prevColorBackground').style.background = colors.prevColor;

  colorSelected = value;
}

function setColor(event) {
  removeClassSelected('.menu_color--item');
  const itemColor = event.target.closest('LI');
  itemColor.classList.add('selected');
  colorSelected = colors[itemColor.id];
}

function chooseSize({ target }) {
  removeClassSelected('.menu_size--item');
  target.classList.add('selected');
  const image = new Image();
  image.src = canvas.toDataURL();
  canvasSize = target.id.slice(-3);
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  image.onload = () => {
    ctx.drawImage(image, 0, 0, canvasSize, canvasSize);
  };
}

function changeRgbaToHex(rgbaData) {
  let [r, g, b, a] = rgbaData;
  r = r.toString(16);
  g = g.toString(16);
  b = b.toString(16);
  a = a.toString(16);
  if (r.length === 1) r = `0${r}`;
  if (g.length === 1) g = `0${g}`;
  if (b.length === 1) b = `0${b}`;
  if (a.length === 1) a = `0${a}`;
  return `#${r}${g}${b}${a}`;
}

function changeHexToRgba(color) {
  const colorHex = (color.length === 7) ? `${color}ff` : color;
  return colorHex.match(/[A-Za-z0-9]{2}/g).map((v) => parseInt(v, 16));
}

function getArrayColorPixel(event) {
  const { offsetX, offsetY } = event;
  const scale = SIZE_CANVAS_CSS / canvasSize;
  return ctx.getImageData(offsetX / scale, offsetY / scale, 1, 1).data;
}

function setColorPicker(event) {
  removeClassSelected('.menu_color--item');
  document.getElementById('currentColor').classList.add('selected');

  const arrayColorPixel = getArrayColorPixel(event);

  let colorNewHex = changeRgbaToHex(arrayColorPixel);
  if (colorNewHex === colorSelected) return;
  if (colorNewHex === '#00000000') {
    colorNewHex = '#ffffffff';
  }
  colorSelected = colorNewHex;
  colors.prevColor = colors.currentColor;
  colors.currentColor = colorNewHex;

  document.getElementById('currentColorBackground').style.background = colorNewHex;
  document.getElementById('prevColorBackground').style.background = colors.prevColor;
}

function drawPencil(event) {
  if (!isDrawing) {
    x = 0;
    y = 0;
    return;
  }
  ctx.fillStyle = colorSelected;
  const { offsetX, offsetY } = event;
  const scale = SIZE_CANVAS_CSS / canvasSize;
  const x1 = Math.trunc(offsetX / scale);
  const y1 = Math.trunc(offsetY / scale);
  let x0 = x || x1;
  let y0 = y || y1;

  // draw first point
  ctx.fillRect(x0, y0, 1, 1);

  // bresenham's line algorithm
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;

  while (!((x0 === x1) && (y0 === y1))) {
    ctx.fillRect(x0, y0, 1, 1);

    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }

  x = x1;
  y = y1;
}

function fillColor(event) {
  const arrayColorPixel = getArrayColorPixel(event);
  const colorSelectedRgba = changeHexToRgba(colorSelected);
  const canvasData = ctx.getImageData(0, 0, SIZE_CANVAS_CSS, SIZE_CANVAS_CSS);

  for (let i = 0; i < canvasData.data.length; i += 4) {
    if (arrayColorPixel.every((item, ind) => item === canvasData.data[i + ind])) {
      for (let j = 0; j < 4; j += 1) {
        canvasData.data[i + j] = colorSelectedRgba[j];
      }
    }
  }
  ctx.putImageData(canvasData, 0, 0);
}

async function loadImage() {
  const img = new Image();
  const valueInput = document.querySelector('#input').value;
  const link = `https://api.unsplash.com/photos/random?query=town,${valueInput}&client_id=7b76a47280b1e328889c12e58cfac9f74a7b39257fe1b4d8a8a4ddb681e74211`;

  const { urls } = await fetch(link).then((res) => res.json());
  img.src = urls.small;
  img.crossOrigin = 'Anonymous';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  img.onload = () => { drawImageOnCanvas(img); };
}

function mousedownHandler(event) {
  isDrawing = true;
  if (toolSelected === 'bucket') { fillColor(event); }
  if (toolSelected === 'picker') { setColorPicker(event); }
  if (toolSelected === 'pencil') { drawPencil(event); }
}

document.querySelector('#load').onclick = loadImage;

canvas.addEventListener('mousemove', drawPencil);
canvas.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('mousedown', mousedownHandler);

document.querySelector('.menu_tools').addEventListener('mousedown', setTools);
document.querySelector('.menu_color').addEventListener('mousedown', setColor);
document.querySelector('.menu_size').addEventListener('mousedown', chooseSize);

window.addEventListener('keydown', setToolsKeyboard);
window.addEventListener('beforeunload', saveSession);
window.addEventListener('input', getInputColor);
