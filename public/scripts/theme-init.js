try {
  var t = localStorage.getItem('traveloop-theme') || 'system';
  var r = document.documentElement;
  if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme:dark)').matches)) {
    r.classList.add('dark');
  } else {
    r.classList.remove('dark');
  }
} catch (e) {}
