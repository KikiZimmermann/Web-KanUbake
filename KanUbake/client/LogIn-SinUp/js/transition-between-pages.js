window.addEventListener('load', () => document.body.style.opacity = '1');
document.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#')) return; // ← skip same-page anchors
    e.preventDefault();
    document.body.style.opacity = '0';
    setTimeout(() => location.href = a.href, 150);
  });
});