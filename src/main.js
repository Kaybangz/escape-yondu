"use strict";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const ORIGINAL_WIDTH = 800;
const ORIGINAL_HEIGHT = 500;

const resizeCanvas = () => {
  const container = canvas.parentElement;
  const containerStyle = window.getComputedStyle(container);

  const paddingX =
    parseFloat(containerStyle.paddingLeft) +
    parseFloat(containerStyle.paddingRight);
  const paddingY =
    parseFloat(containerStyle.paddingTop) +
    parseFloat(containerStyle.paddingBottom);

  const maxWidth = container.clientWidth - paddingX;
  const maxHeight = container.clientHeight - paddingY;

  let width, height;
  const aspectRatio = ORIGINAL_WIDTH / ORIGINAL_HEIGHT;

  if (window.innerWidth > window.innerHeight) {
    height = maxHeight;
    width = height * aspectRatio;
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
  } else {
    width = maxWidth;
    height = width / aspectRatio;
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
  }

  canvas.width = ORIGINAL_WIDTH;
  canvas.height = ORIGINAL_HEIGHT;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const scaleX = ORIGINAL_WIDTH / ORIGINAL_WIDTH;
  const scaleY = ORIGINAL_HEIGHT / ORIGINAL_HEIGHT;
  ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
};

canvas.width = ORIGINAL_WIDTH;
canvas.height = ORIGINAL_HEIGHT;

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let game;
document.addEventListener("DOMContentLoaded", () => {
  game = new Game();
});
