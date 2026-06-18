(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function activate(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        activate(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        activate(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var area = document.querySelector('[data-filter-area]');
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
    if (!area || !lists.length) {
      return;
    }
    var input = area.querySelector('[data-filter-input]');
    var year = area.querySelector('[data-year-filter]');
    var type = area.querySelector('[data-type-filter]');
    var empty = document.querySelector('[data-filter-empty]');
    var cards = [];

    lists.forEach(function (list) {
      cards = cards.concat(Array.prototype.slice.call(list.querySelectorAll('[data-card]')));
    });

    function applyFilter() {
      var query = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var selectedType = normalize(type && type.value);
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type')
        ].join(' '));
        var yearMatch = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
        var typeMatch = !selectedType || normalize(card.getAttribute('data-type')) === selectedType;
        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var isVisible = yearMatch && typeMatch && queryMatch;
        card.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.video-player[data-stream]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.play-layer');
      var stream = player.getAttribute('data-stream');
      var attached = false;
      var hlsInstance = null;

      if (!video || !stream || !button) {
        return;
      }

      function attachStream() {
        if (attached) {
          return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }

      function playVideo() {
        attachStream();
        player.classList.add('is-playing');
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playVideo();
      });

      player.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        if (!player.classList.contains('is-playing')) {
          playVideo();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
