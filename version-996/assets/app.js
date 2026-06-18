(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function bindMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", open);
            button.setAttribute("aria-expanded", String(open));
            panel.setAttribute("aria-hidden", String(!open));
        });
    }

    function bindHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5800);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        start();
    }

    function bindFilters() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]"));
        forms.forEach(function (form) {
            var target = document.getElementById(form.getAttribute("data-card-filter"));
            if (!target) {
                return;
            }
            var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
            function apply() {
                var data = new FormData(form);
                var q = String(data.get("q") || "").trim().toLowerCase();
                var year = String(data.get("year") || "").trim();
                var region = String(data.get("region") || "").trim();
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();
                    var matchText = !q || haystack.indexOf(q) !== -1;
                    var matchYear = !year || card.getAttribute("data-year") === year;
                    var matchRegion = !region || card.getAttribute("data-region") === region;
                    card.classList.toggle("is-hidden", !(matchText && matchYear && matchRegion));
                });
            }
            form.addEventListener("input", apply);
            form.addEventListener("change", apply);
            form.addEventListener("reset", function () {
                window.setTimeout(apply, 0);
            });
        });
    }

    function cardTemplate(item) {
        var safeTitle = escapeHtml(item.title);
        var safeDesc = escapeHtml(item.desc || "");
        return [
            '<article class="movie-card">',
            '<a class="movie-poster" href="./' + item.url + '" aria-label="' + safeTitle + '">',
            '<img src="' + item.cover + '" alt="' + safeTitle + '" loading="lazy">',
            '<span class="poster-shine"></span>',
            '<span class="play-badge">▶</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
            '<h2><a href="./' + item.url + '">' + safeTitle + '</a></h2>',
            '<p>' + safeDesc + '</p>',
            '<div class="tag-row"><span class="tag-pill">' + escapeHtml(item.genre) + '</span></div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];
        });
    }

    function bindSearchPage() {
        var results = document.getElementById("searchResults");
        var input = document.getElementById("searchPageInput");
        if (!results || !window.SEARCH_ITEMS) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = String(params.get("q") || "").trim();
        if (input) {
            input.value = query;
        }
        var normalized = query.toLowerCase();
        var list = window.SEARCH_ITEMS.filter(function (item) {
            if (!normalized) {
                return true;
            }
            return [item.title, item.year, item.region, item.type, item.genre, item.tags].join(" ").toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 120);
        if (!list.length) {
            results.innerHTML = '<div class="search-empty">暂未找到匹配影片，请换一个关键词继续搜索。</div>';
            return;
        }
        results.innerHTML = list.map(cardTemplate).join("");
    }

    window.initPlayer = function (streamUrl) {
        var video = document.getElementById("movieVideo");
        var overlay = document.getElementById("playerOverlay");
        var loaded = false;
        var hls = null;
        if (!video || !streamUrl) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            loaded = true;
        }

        function play() {
            load();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    ready(function () {
        bindMenu();
        bindHero();
        bindFilters();
        bindSearchPage();
    });
})();
