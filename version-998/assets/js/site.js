(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    var input = document.querySelector('[data-search-input]');
    var clear = document.querySelector('[data-clear-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));

    function runSearch() {
      if (!input || cards.length === 0) {
        return;
      }

      var value = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-category') || '',
          card.getAttribute('data-region') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();

        card.classList.toggle('is-hidden', value && text.indexOf(value) === -1);
      });
    }

    if (input) {
      input.addEventListener('input', runSearch);
    }

    if (clear && input) {
      clear.addEventListener('click', function () {
        input.value = '';
        runSearch();
        input.focus();
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var timer = null;

      function show(index) {
        if (slides.length === 0) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });

        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      }

      function start() {
        if (timer || slides.length < 2) {
          return;
        }

        timer = setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          stop();
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });

      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }
  });
})();
