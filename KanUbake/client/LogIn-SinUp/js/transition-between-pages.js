// Er erzeugt einen sanften Fade-Effekt beim Laden und Verlassen einer Seite — die Seite blendet ein, und wenn du auf einen Link klickst, blendet sie aus, bevor die neue Seite lädt.
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

// Seite lädt  →  opacity: 0 → 1  (Fade IN)
// Link klicken  →  opacity: 1 → 0  →  neue Seite laden  (Fade OUT)