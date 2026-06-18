(function () {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.site-nav');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            const open = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-missing');
            image.removeAttribute('src');
        });
    });

    const carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        const prev = carousel.querySelector('[data-hero-prev]');
        const next = carousel.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
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
                show(Number(dot.dataset.heroDot || 0));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
        const target = form.getAttribute('data-target') || '.movie-card';
        const keyword = form.querySelector('input[name="keyword"]');
        const year = form.querySelector('select[name="year"]');
        const type = form.querySelector('select[name="type"]');
        const status = document.querySelector('[data-filter-status]');
        const cards = Array.from(document.querySelectorAll(target));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            const term = normalize(keyword ? keyword.value : '');
            const yearValue = normalize(year ? year.value : '');
            const typeValue = normalize(type ? type.value : '');
            let visible = 0;

            cards.forEach(function (card) {
                const search = normalize(card.getAttribute('data-search'));
                const cardYear = normalize(card.getAttribute('data-year'));
                const cardType = normalize(card.getAttribute('data-type'));
                const matched = (!term || search.indexOf(term) !== -1) &&
                    (!yearValue || cardYear.indexOf(yearValue) !== -1) &&
                    (!typeValue || cardType.indexOf(typeValue) !== -1);
                card.classList.toggle('is-filtered-out', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            if (status) {
                status.textContent = visible > 0 ? '已筛选出符合条件的影片' : '暂无符合条件的影片';
            }
        }

        [keyword, year, type].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilter);
                field.addEventListener('change', applyFilter);
            }
        });
    });
})();
