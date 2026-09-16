// Progressive enhancement: navigation and the article remain usable without JS.
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
function setCurrent(id) {
  navLinks.forEach(link => {
    if (link.getAttribute('href') === `#${id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
let framePending = false;
function updateLocation() {
  framePending = false;
  const line = Math.min(180, window.innerHeight * 0.25);
  const atBottom = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;
  const current = atBottom ? sections.at(-1) : ([...sections].reverse().find(section => section.getBoundingClientRect().top <= line) || sections[0]);
  if (current) setCurrent(current.id);
}
window.addEventListener('scroll', () => {
  if (!framePending) {
    framePending = true;
    window.requestAnimationFrame(updateLocation);
  }
}, { passive: true });
window.addEventListener('resize', updateLocation);
window.addEventListener('load', updateLocation);
updateLocation();
const video = document.querySelector('video');
const fallback = document.querySelector('.media-fallback');
if (video && fallback) {
  const showFallback = () => { fallback.hidden = false; };
  video.addEventListener('error', showFallback);
  video.querySelectorAll('source').forEach(source => source.addEventListener('error', showFallback));
}
