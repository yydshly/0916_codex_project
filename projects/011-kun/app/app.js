'use strict';
// Progressive reading aids; all core guide content is authored in HTML.
const sections = document.querySelectorAll('main > section[id]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      document.querySelectorAll('#contents a').forEach(link => {
        const active = link.getAttribute('href') === '#' + entry.target.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, {rootMargin: '-15% 0px -65% 0px', threshold: 0});
  sections.forEach(section => observer.observe(section));
}
