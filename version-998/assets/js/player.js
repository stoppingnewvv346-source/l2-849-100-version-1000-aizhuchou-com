(function () {
  function attach(video, url) {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    video.setAttribute('data-ready', '1');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }

    video.src = url;
  }

  window.initMoviePlayer = function (videoId, overlayId, url) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);

    if (!video) {
      return;
    }

    function play() {
      attach(video, url);

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var request = video.play();

      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  };
})();
