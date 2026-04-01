const gallery = document.getElementById('masonryGallery');
const items = Array.from(document.querySelectorAll('.masonry-item'));

let fadeObserver;

function getNumColumns() {
  if (window.innerWidth < 480) return 1;
  if (window.innerWidth < 768) return 2;
  return 3;
}

function initMasonry() {
  if (!gallery) return;

  const numColumns = getNumColumns();
  const gutter = 32;

  const containerWidth = gallery.clientWidth;
  const columnWidth = (containerWidth - (numColumns - 1) * gutter) / numColumns;

  const colX = Array.from({ length: numColumns }, (_, index) => (columnWidth + gutter) * index);
  const colHeight = new Array(numColumns).fill(0);

  items.forEach((item) => {
    const wrapper = item.querySelector('.masonry-item-wrapper');
    const img = item.querySelector('img');
    if (!wrapper || !img) return;

    const shortestCol = colHeight.indexOf(Math.min(...colHeight));

    const naturalWidth = img.naturalWidth || Number(img.getAttribute('width')) || 1;
    const naturalHeight = img.naturalHeight || Number(img.getAttribute('height')) || 1;
    const itemHeight = columnWidth * (naturalHeight / naturalWidth);

    item.style.width = columnWidth + 'px';
    item.style.transform = `translate3d(${colX[shortestCol]}px, ${colHeight[shortestCol]}px, 0px)`;

    wrapper.style.height = itemHeight + 'px';
    wrapper.style.overflow = 'hidden';

    img.style.width = columnWidth + 'px';
    img.style.height = itemHeight + 'px';

    colHeight[shortestCol] += itemHeight + gutter;
  });

  gallery.style.height = Math.max(...colHeight) + 'px';
}

function initFadeIn() {
  items.forEach((item, i) => {
    const wrapper = item.querySelector('.masonry-item-wrapper');
    if (wrapper) {
      wrapper.style.transitionDelay = i * 0.05 + 's';
    }
  });

  if (fadeObserver) fadeObserver.disconnect();

  fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const wrapper = entry.target.querySelector('.masonry-item-wrapper');
          if (wrapper) {
            wrapper.classList.add('visible');
          }
          fadeObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  items.forEach((item) => fadeObserver.observe(item));
}

function initLightbox() {
  const links = Array.from(document.querySelectorAll('.masonry-image-link'));
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  if (!lightbox || !lightboxImage || !lightboxClose || !lightboxPrev || !lightboxNext) return;

  let currentIndex = 0;

  function openAt(index) {
    const safeIndex = (index + links.length) % links.length;
    const imageNode = links[safeIndex].querySelector('img');
    if (!imageNode) return;

    currentIndex = safeIndex;
    lightboxImage.src = imageNode.currentSrc || imageNode.src;
    lightboxImage.alt = imageNode.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  links.forEach((link, index) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openAt(index);
    });
  });

  lightboxClose.addEventListener('click', close);
  lightboxPrev.addEventListener('click', () => openAt(currentIndex - 1));
  lightboxNext.addEventListener('click', () => openAt(currentIndex + 1));

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') openAt(currentIndex - 1);
    if (event.key === 'ArrowRight') openAt(currentIndex + 1);
  });
}

let resizeTimeout;
window.addEventListener('resize', () => {
  window.clearTimeout(resizeTimeout);
  resizeTimeout = window.setTimeout(() => {
    initMasonry();
  }, 150);
});

document.addEventListener('DOMContentLoaded', () => {
  initMasonry();
  initFadeIn();
  initLightbox();

  const images = Array.from(gallery.querySelectorAll('img'));
  images.forEach((img) => {
    if (img.complete) return;
    img.addEventListener('load', initMasonry);
  });
});
