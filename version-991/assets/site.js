(() => {
  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  const assetBase = (() => {
    const script = document.currentScript || document.querySelector('script[src$="assets/site.js"]');
    return script ? new URL('.', script.src) : new URL('./assets/', document.baseURI);
  })();

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  const loadScript = (src) => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      if (window.Hls) {
        resolve();
      }
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  let hlsLoader = null;

  const getHls = () => {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (!hlsLoader) {
      hlsLoader = import(new URL('hls.js', assetBase).href)
        .then((module) => module.H || module.default || window.Hls)
        .catch(() => loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js').then(() => window.Hls));
    }
    return hlsLoader;
  };

  const initMenu = () => {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', () => {
      menu.classList.toggle('is-open');
    });
  };

  const initHeaderSearch = () => {
    document.querySelectorAll('.header-search').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = form.querySelector('input[name="q"]');
        const query = input ? input.value.trim() : '';
        if (query) {
          window.location.href = `./search.html?q=${encodeURIComponent(query)}`;
        }
      });
    });
  };

  const initHero = () => {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, itemIndex) => {
        slide.classList.toggle('active', itemIndex === current);
      });
      dots.forEach((dot, itemIndex) => {
        dot.classList.toggle('active', itemIndex === current);
      });
    };

    const restart = () => {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(() => show(current + 1), 5000);
    };

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(current + 1);
        restart();
      });
    }

    restart();
  };

  const initCategoryTools = () => {
    const tools = document.querySelector('[data-category-tools]');
    const list = document.querySelector('[data-card-list]');
    if (!tools || !list) {
      return;
    }
    const input = tools.querySelector('[data-filter-input]');
    const year = tools.querySelector('[data-year-filter]');
    const sort = tools.querySelector('[data-sort-select]');
    const cards = Array.from(list.querySelectorAll('[data-card]'));

    const apply = () => {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const selectedYear = year ? year.value : '';
      const mode = sort ? sort.value : 'default';
      cards.forEach((card) => {
        const haystack = `${card.dataset.title || ''} ${card.dataset.tags || ''}`.toLowerCase();
        const matchesText = !keyword || haystack.includes(keyword);
        const matchesYear = !selectedYear || card.dataset.year === selectedYear;
        card.style.display = matchesText && matchesYear ? '' : 'none';
      });
      const sorted = cards.slice().sort((left, right) => {
        if (mode === 'rating') {
          return Number(right.dataset.rating || 0) - Number(left.dataset.rating || 0);
        }
        if (mode === 'year') {
          return Number(right.dataset.year || 0) - Number(left.dataset.year || 0);
        }
        return Number(left.dataset.index || 0) - Number(right.dataset.index || 0);
      });
      sorted.forEach((card) => list.appendChild(card));
    };

    [input, year, sort].forEach((control) => {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  };

  const initSearch = () => {
    const form = document.querySelector('[data-search-form]');
    const input = document.querySelector('[data-search-input]');
    const results = document.querySelector('[data-search-results]');
    if (!form || !input || !results || !window.movieSearchIndex) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    input.value = initialQuery;

    const renderCard = (movie) => {
      const title = escapeHtml(movie.title);
      const file = escapeHtml(movie.file);
      const image = escapeHtml(movie.image);
      const year = escapeHtml(movie.year);
      const oneLine = escapeHtml(movie.oneLine);
      const region = escapeHtml(movie.region);
      const type = escapeHtml(movie.type);
      const rating = escapeHtml(movie.rating);
      const tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 3) : [];
      return `
      <article class="movie-card compact-card">
        <a href="./${file}" class="card-link">
          <div class="card-cover">
            <img src="${image}" alt="${title}" loading="lazy">
            <span class="year-badge">${year}</span>
            <span class="play-badge">▶</span>
          </div>
          <div class="card-body">
            <h3>${title}</h3>
            <p>${oneLine}</p>
            <div class="card-meta">
              <span>${region}</span>
              <span>${type}</span>
              <span>${rating}分</span>
            </div>
            <div class="tag-row">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
          </div>
        </a>
      </article>
    `;
    };

    const runSearch = (query) => {
      const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const source = window.movieSearchIndex;
      const matched = terms.length === 0
        ? source.slice(0, 24)
        : source.filter((movie) => {
            const haystack = `${movie.title} ${movie.region} ${movie.type} ${movie.year} ${movie.genres} ${movie.tags} ${movie.oneLine}`.toLowerCase();
            return terms.every((term) => haystack.includes(term));
          }).slice(0, 120);
      results.innerHTML = matched.length
        ? matched.map(renderCard).join('')
        : '<div class="content-panel"><h2>暂无相关影片</h2><p>可以尝试更换片名、地区、年份或类型关键词。</p></div>';
    };

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = input.value.trim();
      const url = query ? `./search.html?q=${encodeURIComponent(query)}` : './search.html';
      window.history.replaceState(null, '', url);
      runSearch(query);
    });

    runSearch(initialQuery);
  };

  const initPlayer = () => {
    const player = document.querySelector('[data-player]');
    if (!player) {
      return;
    }
    const video = player.querySelector('video');
    const button = player.querySelector('[data-play-button]');
    const src = player.dataset.src;
    if (!video || !button || !src) {
      return;
    }

    let bound = false;

    const bindWithHls = (Hls) => {
      if (!Hls || !Hls.isSupported()) {
        video.src = src;
        return Promise.resolve();
      }
      if (!bound) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        video.hlsInstance = hls;
        bound = true;
      }
      return Promise.resolve();
    };

    const start = () => {
      button.classList.add('is-hidden');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = src;
        }
        video.play().catch(() => {});
        return;
      }
      getHls()
        .then(bindWithHls)
        .then(() => video.play().catch(() => {}))
        .catch(() => {
          if (!video.src) {
            video.src = src;
          }
          video.play().catch(() => {});
        });
    };

    button.addEventListener('click', start);
    video.addEventListener('click', () => {
      if (video.paused) {
        start();
      }
    });
  };

  ready(() => {
    initMenu();
    initHeaderSearch();
    initHero();
    initCategoryTools();
    initSearch();
    initPlayer();
  });
})();
