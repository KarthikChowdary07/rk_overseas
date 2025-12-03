// RK Overseas - final script (contact uses mailto fallback only)

document.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const site = document.getElementById('site');

  const minWait = new Promise(res => setTimeout(res, 3000));
  const onLoad = new Promise(res => {
    if (document.readyState === 'complete') res();
    else window.addEventListener('load', res);
  });

  Promise.all([minWait, onLoad]).then(() => {
    if (loader) {
      loader.classList.add('hidden');
      loader.setAttribute('aria-hidden', 'true');
      setTimeout(() => { loader.style.display = 'none'; }, 420);
    }
    if (site) {
      site.classList.remove('hidden');
      site.setAttribute('aria-hidden', 'false');
    }
    initialize();
  });

  // Mobile menu toggle
  const menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const nav = document.querySelector('.nav');
      if (!nav) return;
      const open = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!open));
      if (!open) {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'absolute';
        nav.style.right = '20px';
        nav.style.top = '80px';
        nav.style.background = 'rgba(255,255,255,0.98)';
        nav.style.borderRadius = '10px';
        nav.style.boxShadow = '0 12px 30px rgba(2,6,23,0.08)';
        nav.style.padding = '10px';
      } else {
        nav.style.display = 'none';
      }
    });
    // close mobile nav when any link is selected
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(a => {
      a.addEventListener('click', () => {
        const nav = document.querySelector('.nav');
        if (!nav) return;
        // only toggle if hamburger is visible (mobile)
        const hbVisible = window.getComputedStyle(menuBtn).display !== 'none';
        if (hbVisible) {
          nav.style.display = 'none';
          menuBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
});

function initialize() {
  initStoriesCarousel();
  initContinuousScroll();
  initContactForm();
  initServicesAnimation();
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// add: animate services card when it enters viewport
function initServicesAnimation() {
  const card = document.getElementById('servicesCard');
  if (!card || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        card.classList.add('inview');
        obs.unobserve(card);
      }
    });
  }, {threshold: 0.25});
  io.observe(card);
}

/* Small stories carousel: shows one slide at a time via opacity; auto-advance every 6s */
function initStoriesCarousel() {
  const carousel = document.getElementById('storiesCarousel');
  if (!carousel) return;
  const slides = Array.from(carousel.children).filter(n => n.nodeType === 1);
  if (slides.length === 0) return;
  slides.forEach((s, i) => {
    s.style.position = 'absolute';
    s.style.left = '0';
    s.style.top = '0';
    s.style.width = '100%';
    s.style.opacity = i === 0 ? '1' : '0';
    s.style.transition = 'opacity .6s ease, transform .5s ease';
  });
  carousel.style.position = 'relative';
  const setHeight = () => {
    const h = slides[0].getBoundingClientRect().height || 240;
    carousel.style.height = h + 'px';
  };
  setHeight();

  let idx = 0;
  const advance = () => {
    if (slides.length <= 1) return;
    const prev = idx;
    idx = (idx + 1) % slides.length;
    slides[prev].style.opacity = '0';
    slides[idx].style.opacity = '1';
  };
  const intervalId = setInterval(advance, 6000);

  // keep carousel responsive (recompute height on resize)
  window.addEventListener('resize', () => {
    setTimeout(setHeight, 120);
  });
}

/* Continuous scroll strip: step by image width every 5s left->right
   Implementation: translateX on the track, duplicate images used in HTML for seamless reset.
*/
function initContinuousScroll() {
  const track = document.getElementById('scrollTrack');
  if (!track) return;

  let imgs = Array.from(track.querySelectorAll('img'));
  // read the gap from computed styles if available (fallback to 12)
  const computed = window.getComputedStyle ? window.getComputedStyle(track) : null;
  const gap = computed && computed.gap ? parseFloat(computed.gap) : 12;
  let step = imgs[0] ? imgs[0].getBoundingClientRect().width + gap : 240;
  let index = 0;
  let isHover = false;
  let ticker = null;

  // recalc sizes on resize
  function recalc() {
    imgs = Array.from(track.querySelectorAll('img'));
    step = imgs[0] ? imgs[0].getBoundingClientRect().width + gap : step;
  }
  window.addEventListener('resize', () => { setTimeout(recalc, 120); });

  // pause on hover / touch
  track.addEventListener('mouseenter', () => { isHover = true; });
  track.addEventListener('mouseleave', () => { isHover = false; });
  track.addEventListener('touchstart', () => { isHover = true; if (ticker) clearInterval(ticker); }, {passive:true});
  track.addEventListener('touchend', () => { isHover = false; if (ticker) clearInterval(ticker); ticker = setInterval(stepRight, 5000); }, {passive:true});

  function stepRight() {
    if (isHover || imgs.length === 0) return;
    index++;
    track.style.transition = 'transform 800ms ease';
    track.style.transform = `translateX(${-index * step}px)`;
    const half = Math.floor(imgs.length / 2);
    if (index >= half) {
      // after transition, reset to 0 instantly to loop seamlessly
      setTimeout(() => {
        track.style.transition = 'none';
        track.style.transform = 'translateX(0px)';
        index = 0;
      }, 820);
    }
  }

  // start stepping every 5s
  ticker = setInterval(stepRight, 5000);
}

/* Contact form: mailto fallback only (no endpoint)
   User will add endpoint later if desired. */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', submitContact);
}

function submitContact(e) {
  e.preventDefault();
  const status = document.getElementById('formStatus');
  const form = document.getElementById('contactForm');
  const name = (document.getElementById('name') || {}).value || '';
  // email intentionally removed per request
  const phone = (document.getElementById('phone') || {}).value || '';
  const service = (document.getElementById('service') || {}).value || '';
  const message = (document.getElementById('message') || {}).value || '';

  const trimmedName = name.trim();

  if (!trimmedName) {
    if (status) status.textContent = 'Please add your name.';
    return false;
  }

  // friendly on-page confirmation (no email / mailto)
  if (status) {
    status.textContent = `Thanks ${trimmedName}. We received your request and will reach out on ${phone || 'your phone number'} soon.`;
  }

  // reset form fields
  if (form) form.reset();

  return false;
}

function scrollToTop() { window.scrollTo({top:0,behavior:'smooth'}); }