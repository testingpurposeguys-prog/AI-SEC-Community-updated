/* Home hero slider: arrows, dots, auto-advance (paused on hover/focus). */
(function () {
  var slider = document.getElementById('hero-slider');
  if (!slider) return;
  var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
  var content = slider.parentNode;
  var dotsBox = content.querySelector('.hero-dots');
  var prev = content.querySelector('.hero-arrow--prev');
  var next = content.querySelector('.hero-arrow--next');
  var current = 0, timer = null;

  var dots = slides.map(function (_, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'hero-dot';
    b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    b.addEventListener('click', function () { go(i); restart(); });
    dotsBox.appendChild(b);
    return b;
  });

  function go(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) {
      var on = n === current;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    dots.forEach(function (d, n) { d.classList.toggle('is-active', n === current); });
  }
  function restart() {
    clearInterval(timer);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = setInterval(function () { go(current + 1); }, 6000);
  }

  prev.addEventListener('click', function () { go(current - 1); restart(); });
  next.addEventListener('click', function () { go(current + 1); restart(); });
  content.addEventListener('mouseenter', function () { clearInterval(timer); });
  content.addEventListener('mouseleave', restart);

  go(0);
  restart();
})();
