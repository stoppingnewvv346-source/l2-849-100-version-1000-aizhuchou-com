(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;

    var showSlide = function (target) {
      if (!slides.length) {
        return;
      }

      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterYear = document.querySelector('[data-filter-year]');
  var filterRegion = document.querySelector('[data-filter-region]');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));
    var applyFilter = function () {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
      var year = filterYear ? filterYear.value : '';
      var region = filterRegion ? filterRegion.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var matched = true;

        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (region && cardRegion !== region) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
      });
    };

    [filterInput, filterYear, filterRegion].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  }

  var drawer = document.querySelector('[data-search-drawer]');
  var results = document.querySelector('[data-search-results]');
  var closeButton = document.querySelector('[data-search-close]');
  var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));

  var closeSearch = function () {
    if (drawer) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
    }
  };


  var escapeHtml = function (value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  };

  var openSearch = function (query) {
    if (!drawer || !results) {
      return;
    }

    var q = query.trim().toLowerCase();
    var items = (window.searchIndex || []).filter(function (item) {
      return item.text.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 24);

    if (!q) {
      items = (window.searchIndex || []).slice(0, 12);
    }

    results.innerHTML = items.map(function (item) {
      return '<a class="search-result" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">' +
        '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.meta) + '</span></span>' +
        '</a>';
    }).join('');

    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
  };

  forms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      openSearch(input ? input.value : '');
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeSearch);
  }

  if (drawer) {
    drawer.addEventListener('click', function (event) {
      if (event.target === drawer) {
        closeSearch();
      }
    });
  }
})();
