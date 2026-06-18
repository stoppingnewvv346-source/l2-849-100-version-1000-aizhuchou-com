(function () {
    const video = document.querySelector('.movie-video');
    const overlay = document.querySelector('.player-overlay');
    const source = typeof playerSource !== 'undefined' ? playerSource : '';
    let hlsInstance = null;

    if (!video || !source) {
        return;
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    }

    function showOverlay() {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    }

    function attachSource() {
        if (video.dataset.ready === 'true') {
            return;
        }

        video.dataset.ready = 'true';

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                    return;
                }
                hlsInstance.destroy();
                hlsInstance = null;
            });
            return;
        }

        video.src = source;
    }

    function startPlayback() {
        attachSource();
        hideOverlay();
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {
                showOverlay();
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });

    video.addEventListener('play', hideOverlay);
})();
