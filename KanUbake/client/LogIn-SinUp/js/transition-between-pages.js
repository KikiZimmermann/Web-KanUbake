window.addEventListener('load', () => document.body.style.opacity = '1');
document.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const href = a.href;
    document.body.style.opacity = '0';
    setTimeout(() => location.href = href, 150);
  });
});
