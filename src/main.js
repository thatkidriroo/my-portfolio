import './style.css';
import { createScene } from './scene.js';
import { inject } from '@vercel/analytics';

const slideCount = 17;
const { start, setScroll } = createScene(slideCount);

const track = document.getElementById('track');
const slides = document.querySelectorAll('.slide');
const progressBar = document.querySelector('.nav-progress-bar');
const totalWidth = slideCount * window.innerWidth;

document.body.style.height = `${slideCount * 100}vh`;

let current = 0;
let target = 0;
let activeIndex = -1;
let lastScrollY = 0;
let settleFrames = 0;

function update() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const rawScroll = window.scrollY;

  target = rawScroll / maxScroll;

  if (!isDragging) {
    if (Math.abs(rawScroll - lastScrollY) < 0.5) {
      settleFrames++;
      if (settleFrames >= 60) {
        const nearest = Math.round(target * (slideCount - 1));
        const snapProgress = nearest / (slideCount - 1);
        const snapScroll = snapProgress * maxScroll;
        if (Math.abs(rawScroll - snapScroll) > 1) {
          window.scrollTo(0, snapScroll);
          target = snapProgress;
        }
        settleFrames = 0;
      }
    } else {
      settleFrames = 0;
    }
  }
  lastScrollY = rawScroll;

  current += (target - current) * 0.025;

  const tx = -current * totalWidth;
  track.style.transform = `translate3d(${tx}px, 0, 0)`;

  setScroll(current);

  if (progressBar) progressBar.style.width = `${current * 100}%`;

  const viewCenter = current * totalWidth + window.innerWidth * 0.5;

  slides.forEach((slide, i) => {
    const slideCenter = i * window.innerWidth + window.innerWidth * 0.5;
    const dist = Math.abs(slideCenter - viewCenter);
    const isActive = dist < window.innerWidth * 0.6;
    slide.classList.toggle('active', isActive);
  });

  requestAnimationFrame(update);
}

slides.forEach((slide) => {
  const links = slide.querySelectorAll('a');
  links.forEach((link) => {
    link.addEventListener('click', (e) => e.stopPropagation());
  });
});

/* ── Drag-to-scroll ── */

let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartScroll = 0;

function getClientX(e) {
  return e.touches ? e.touches[0].clientX : e.clientX;
}

function getClientY(e) {
  return e.touches ? e.touches[0].clientY : e.clientY;
}

function dragStart(e) {
  isDragging = true;
  dragStartX = getClientX(e);
  dragStartY = getClientY(e);
  dragStartScroll = window.scrollY;
  track.classList.add('grabbing');
}

function dragMove(e) {
  if (!isDragging) return;
  settleFrames = 0;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const cx = getClientX(e);
  const cy = getClientY(e);
  const deltaX = dragStartX - cx;
  const deltaY = dragStartY - cy;
  const delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
  const ratio = (maxScroll / window.innerWidth) * 0.35;
  window.scrollTo(0, Math.max(0, Math.min(dragStartScroll + delta * ratio, maxScroll)));
}

function dragEnd() {
  if (!isDragging) return;
  isDragging = false;
  track.classList.remove('grabbing');
}

/* Mouse */
track.addEventListener('mousedown', (e) => { dragStart(e); e.preventDefault(); });
window.addEventListener('mousemove', dragMove);
window.addEventListener('mouseup', dragEnd);

/* Touch */
track.addEventListener('touchstart', (e) => dragStart(e), { passive: true });
track.addEventListener('touchmove', dragMove, { passive: true });
track.addEventListener('touchend', dragEnd);
track.addEventListener('touchcancel', dragEnd);

requestAnimationFrame(update);
start();

// Initialize Vercel Analytics
inject();
