// [ •••••••• ]  👁  ←  Button erscheint neben jedem Passwortfeld
// Klick drauf → Passwort wird sichtbar, Icon wechselt. Nochmal klick → wieder versteckt.
document.querySelectorAll('input[type="password"]').forEach(input => {
  const wrap = document.createElement('div');
  wrap.className = 'pass-wrap';
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pass-toggle';
  btn.setAttribute('aria-label', 'Show password');
  btn.innerHTML = `
    <svg class="eye-on" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
    <svg class="eye-off" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
      style="display:none">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>`;
  wrap.appendChild(btn);

  btn.addEventListener('click', () => {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.querySelector('.eye-on').style.display  = isHidden ? 'none' : '';
    btn.querySelector('.eye-off').style.display = isHidden ? ''     : 'none';
    btn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });
});