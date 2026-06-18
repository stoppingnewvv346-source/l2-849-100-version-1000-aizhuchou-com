(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupLocalFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".card-filter"));
        inputs.forEach(function (input) {
            var targetId = input.getAttribute("data-filter-target");
            var target = targetId ? document.getElementById(targetId) : null;
            if (!target) {
                return;
            }
            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-category") || "",
                        card.getAttribute("data-year") || "",
                        card.textContent || ""
                    ].join(" ").toLowerCase();
                    card.classList.toggle("is-hidden-by-filter", keyword && haystack.indexOf(keyword) === -1);
                });
            });
        });
    }

    function getQueryValue(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function renderSearchResult(movie) {
        return [
            "<article class=\"movie-card\">",
            "<a href=\"./" + movie.url + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
            "<div class=\"card-poster\">",
            "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"category-label\">" + escapeHtml(movie.category) + "</span>",
            "<span class=\"play-hover\">▶</span>",
            "</div>",
            "<div class=\"card-content\">",
            "<h2>" + escapeHtml(movie.title) + "</h2>",
            "<p>" + escapeHtml(movie.oneLine) + "</p>",
            "<div class=\"card-meta-row\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span></div>",
            "</div>",
            "</a>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function setupSearchPage() {
        var results = document.getElementById("search-results");
        var input = document.getElementById("search-input");
        if (!results || !input || !Array.isArray(window.MOVIE_DATA)) {
            return;
        }
        var query = getQueryValue("q").trim();
        input.value = query;
        if (!query) {
            results.innerHTML = "<div class=\"empty-state\">输入关键词即可搜索片库中的影片。</div>";
            return;
        }
        var keyword = query.toLowerCase();
        var matched = window.MOVIE_DATA.filter(function (movie) {
            return [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.tags, movie.category].join(" ").toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 120);
        if (!matched.length) {
            results.innerHTML = "<div class=\"empty-state\">没有找到匹配影片，可以尝试更短的关键词。</div>";
            return;
        }
        results.innerHTML = "<div class=\"search-result-grid\">" + matched.map(renderSearchResult).join("") + "</div>";
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("movie-player");
        var cover = document.getElementById("player-cover");
        var hlsInstance = null;
        var attached = false;

        if (!video || !sourceUrl) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function play() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupLocalFilters();
        setupSearchPage();
    });
})();
