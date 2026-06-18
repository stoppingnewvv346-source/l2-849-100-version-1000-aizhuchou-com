(function () {
  var video = document.querySelector('.movie-video');
  var button = document.querySelector('[data-play-button]');

  if (!video || !button) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var hls;

  var startVideo = function () {
    if (!stream) {
      return;
    }

    button.classList.add('is-hidden');
    video.controls = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', stream);
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (!hls) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.play().catch(function () {});
      }
      return;
    }

    if (!video.getAttribute('src')) {
      video.setAttribute('src', stream);
    }
    video.play().catch(function () {});
  };

  button.addEventListener('click', startVideo);
  video.addEventListener('click', function () {
    if (video.paused) {
      startVideo();
    }
  });
})();
