(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('mobile-nav-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer = null;

    function setActive(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setActive(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setActive(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function yearMatches(value, year) {
    if (!value) {
      return true;
    }
    if (value === '2020s') {
      return year >= 2020;
    }
    if (value === '2010s') {
      return year >= 2010 && year <= 2019;
    }
    if (value === '2000s') {
      return year >= 2000 && year <= 2009;
    }
    if (value === 'classic') {
      return year < 2000;
    }
    return true;
  }

  function initFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    if (!cards.length) {
      return;
    }
    var searchInput = document.querySelector('[data-search-input]');
    var regionSelect = document.querySelector('[data-filter-region]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var visibleCount = document.querySelector('[data-visible-count]');
    var emptyState = document.querySelector('[data-empty-state]');

    function applyFilters() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var yearValue = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-text') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = Number(card.getAttribute('data-year') || 0);
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchRegion = !region || cardRegion.indexOf(region) !== -1;
        var matchType = !type || cardType.indexOf(type) !== -1;
        var matchYear = yearMatches(yearValue, cardYear);
        var show = matchQuery && matchRegion && matchType && matchYear;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });

      if (visibleCount) {
        visibleCount.textContent = String(visible);
      }
      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initFilters();
  });
}());
