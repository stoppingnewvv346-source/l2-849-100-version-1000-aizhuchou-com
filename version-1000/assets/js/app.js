(function () {
  function selectAll(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", slider);
    var dots = selectAll("[data-hero-dot]", slider);
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        play();
      });
    });

    show(0);
    play();
  }

  function filterCards(scope, query, value) {
    var cards = selectAll("[data-card]", scope);
    var normalizedQuery = normalize(query);
    var normalizedValue = normalize(value);
    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-keywords")
      ].join(" "));
      var queryOk = !normalizedQuery || haystack.indexOf(normalizedQuery) !== -1;
      var valueOk = !normalizedValue || normalizedValue === "全部" || haystack.indexOf(normalizedValue) !== -1;
      card.hidden = !(queryOk && valueOk);
    });
  }

  function initSearches() {
    selectAll("[data-filter-input]").forEach(function (input) {
      var scope = document.querySelector(input.getAttribute("data-filter-scope")) || document;
      input.addEventListener("input", function () {
        filterCards(scope, input.value, scope.getAttribute("data-active-filter") || "全部");
      });
    });
  }

  function initFilterBars() {
    selectAll("[data-filter-group]").forEach(function (bar) {
      var scope = document.querySelector(bar.getAttribute("data-filter-group"));
      if (!scope) {
        return;
      }
      var input = document.querySelector('[data-filter-scope="#' + scope.id + '"]');
      selectAll("[data-filter-value]", bar).forEach(function (button) {
        button.addEventListener("click", function () {
          selectAll("[data-filter-value]", bar).forEach(function (item) {
            item.classList.remove("active");
          });
          button.classList.add("active");
          scope.setAttribute("data-active-filter", button.getAttribute("data-filter-value"));
          filterCards(scope, input ? input.value : "", button.getAttribute("data-filter-value"));
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHeroSlider();
    initSearches();
    initFilterBars();
  });
})();
