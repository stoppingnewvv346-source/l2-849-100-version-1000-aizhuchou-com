(function () {
  function initMoviePlayer(streamUrl, config) {
    var options = config || {};
    var video = document.getElementById(options.video || "movie-video");
    var button = document.getElementById(options.button || "movie-play");
    var loaded = false;
    var hls = null;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      loaded = true;
    }

    function begin() {
      attach();
      if (button) {
        button.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }

    if (button) {
      button.addEventListener("click", begin);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        begin();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (button) {
        button.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
