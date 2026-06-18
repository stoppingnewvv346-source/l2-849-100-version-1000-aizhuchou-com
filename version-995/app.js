(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
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
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    function setupSearch() {
        var panel = document.querySelector("[data-search-panel]");
        if (!panel) {
            return;
        }
        var input = panel.querySelector("[data-search-input]");
        var region = panel.querySelector("[data-region-filter]");
        var type = panel.querySelector("[data-type-filter]");
        var year = panel.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var empty = document.querySelector("[data-empty-state]");

        function match(card) {
            var text = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags
            ].join(" ").toLowerCase();
            var keyword = (input.value || "").trim().toLowerCase();
            var okKeyword = !keyword || text.indexOf(keyword) !== -1;
            var okRegion = !region.value || card.dataset.region.indexOf(region.value) !== -1;
            var okType = !type.value || card.dataset.type.indexOf(type.value) !== -1;
            var okYear = !year.value || card.dataset.year === year.value;
            return okKeyword && okRegion && okType && okYear;
        }

        function update() {
            var visible = 0;
            cards.forEach(function (card) {
                var keep = match(card);
                card.style.display = keep ? "" : "none";
                if (keep) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? "none" : "block";
            }
        }

        [input, region, type, year].forEach(function (control) {
            control.addEventListener("input", update);
            control.addEventListener("change", update);
        });
        update();
    }

    function playWithHls(video, url) {
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video._hls = hls;
            return new Promise(function (resolve) {
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve(video.play());
                });
            });
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            if (video.src !== url) {
                video.src = url;
            }
            return video.play();
        }
        if (video.src !== url) {
            video.src = url;
        }
        return video.play();
    }


    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("video[data-stream-url]"));
        players.forEach(function (video) {
            window.MovieSite.player(video.id, video.getAttribute("data-stream-url"));
        });
    }

    window.MovieSite = {
        player: function (videoId, url) {
            var video = document.getElementById(videoId);
            if (!video) {
                return;
            }
            var box = video.closest(".player-box");
            var cover = box ? box.querySelector(".player-cover") : null;
            var started = false;

            function start() {
                if (started) {
                    video.play().catch(function () {});
                    return;
                }
                started = true;
                playWithHls(video, url).catch(function () {});
            }

            if (cover) {
                cover.addEventListener("click", start);
            }
            video.addEventListener("click", start);
            video.addEventListener("play", function () {
                if (box) {
                    box.classList.add("playing");
                }
            });
            video.addEventListener("pause", function () {
                if (box) {
                    box.classList.remove("playing");
                }
            });
        }
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayers();
    });
})();
