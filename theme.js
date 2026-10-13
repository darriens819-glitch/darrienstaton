/* Theme menu: Light / Auto / Dark. Auto follows the device setting. */
(function () {
  var root = document.documentElement;
  var menu = document.querySelector('.theme-menu');
  if (!menu) return;
  var btn = menu.querySelector('.theme-menu__btn');
  var list = menu.querySelector('.theme-menu__list');
  var items = list.querySelectorAll('button[data-mode]');
  var status = document.getElementById('theme-status');
  var names = { light: 'Light', auto: 'Auto', dark: 'Dark' };
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var fadeTimer, spinTimer;

  function read() {
    try {
      var v = localStorage.getItem('theme');
      if (v === 'light' || v === 'dark') return v;
    } catch (e) {}
    return 'auto';
  }
  function write(mode) {
    try {
      if (mode === 'auto') localStorage.removeItem('theme');
      else localStorage.setItem('theme', mode);
    } catch (e) {}
  }
  function isDark(mode) {
    return mode === 'dark' || (mode === 'auto' && mq && mq.matches);
  }
  function paintMeta(mode) {
    var color = isDark(mode) ? '#0D1015' : '#F1F3F6';
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) metas[i].setAttribute('content', color);
  }
  function apply(mode, announce, animate) {
    if (animate) {
      root.classList.add('theme-fade');
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(function () { root.classList.remove('theme-fade'); }, 450);
      menu.classList.add('is-switching');
      clearTimeout(spinTimer);
      spinTimer = setTimeout(function () { menu.classList.remove('is-switching'); }, 700);
    }
    if (mode === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    menu.setAttribute('data-mode', mode);
    btn.setAttribute('aria-label', 'Theme: ' + names[mode]);
    for (var i = 0; i < items.length; i++) {
      items[i].setAttribute('aria-pressed', items[i].getAttribute('data-mode') === mode ? 'true' : 'false');
    }
    paintMeta(mode);
    if (announce && status) status.textContent = 'Theme: ' + names[mode];
  }

  function isOpen() { return !list.hidden; }
  function open() {
    list.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    var current = list.querySelector('button[aria-pressed="true"]') || items[0];
    current.focus();
  }
  function close(returnFocus) {
    if (!isOpen()) return;
    list.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (returnFocus) btn.focus();
  }

  btn.addEventListener('click', function () { isOpen() ? close(false) : open(); });
  for (var i = 0; i < items.length; i++) {
    items[i].addEventListener('click', function () {
      var mode = this.getAttribute('data-mode');
      write(mode);
      apply(mode, true, true);
      close(true);
    });
  }
  menu.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen()) { e.preventDefault(); close(true); return; }
    if (!isOpen()) {
      if (e.target === btn && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) { e.preventDefault(); open(); }
      return;
    }
    var idx = Array.prototype.indexOf.call(items, document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx + 1 + items.length) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(idx - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
  });
  /* close when focus leaves the menu, or on a click elsewhere */
  menu.addEventListener('focusout', function (e) {
    if (isOpen() && e.relatedTarget && !menu.contains(e.relatedTarget)) close(false);
  });
  document.addEventListener('click', function (e) {
    if (isOpen() && !menu.contains(e.target)) close(false);
  });

  if (mq) {
    var onChange = function () { if (read() === 'auto') paintMeta('auto'); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
  apply(read(), false, false);
})();
