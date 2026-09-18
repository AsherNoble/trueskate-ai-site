/* ============================================================
   TrueSkate-AI — main.js
   Core behaviour: nav scrollspy, click-to-play clips, tap-to-pause loops.
   No browser-storage APIs are used anywhere.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Nav scrollspy ---------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll("[data-nav-link]"));
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    var headings = [];
    links.forEach(function (link) {
      var id = (link.getAttribute("href") || "").replace("#", "");
      var heading = id && document.getElementById(id);
      if (heading) { map[id] = link; headings.push(heading); }
    });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("is-active"); });
          var active = map[entry.target.id];
          if (active) active.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });

    headings.forEach(function (heading) { spy.observe(heading); });
  }

  /* ---------- Click-to-play clips ---------- */
  function initClips() {
    var clips = Array.prototype.slice.call(document.querySelectorAll(".doc-clip"));
    clips.forEach(function (clip) {
      var btn = clip.querySelector(".doc-clip__btn");
      if (!btn) return;

      btn.addEventListener("click", function () {
        if (clip.classList.contains("is-playing")) return;

        var src = clip.getAttribute("data-src");
        var poster = clip.querySelector(".doc-clip__poster");

        var video = document.createElement("video");
        video.className = "doc-clip__video";
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.controls = true;
        if (poster) video.poster = poster.getAttribute("src");

        if (src) {
          var source = document.createElement("source");
          source.src = src;
          video.appendChild(source);
        }

        clip.appendChild(video);
        clip.classList.add("is-playing");

        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
          playResult.catch(function () {
            /* leave controls visible; nothing to do */
          });
        }
      });
    });
  }

  /* ---------- Tap-to-pause looping clips ---------- */
  function initLoopClips() {
    var loops = Array.prototype.slice.call(document.querySelectorAll("[data-loop]"));
    loops.forEach(function (loop) {
      var video = loop.querySelector("video");
      var btn = loop.querySelector(".doc-loop__btn");
      if (!video || !btn) return;

      function setPaused(paused) {
        loop.classList.toggle("is-paused", paused);
        btn.setAttribute("aria-pressed", paused ? "true" : "false");
        btn.setAttribute("aria-label", paused ? "Play clip" : "Pause clip");
      }

      btn.addEventListener("click", function () {
        if (video.paused) {
          var playResult = video.play();
          if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () { setPaused(true); });
          }
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () { setPaused(false); });
      video.addEventListener("pause", function () { setPaused(true); });

      /* Autoplay can be refused (low-power mode, reduced-motion settings) —
         reflect whatever state the video actually settles in. */
      setPaused(video.paused);
    });
  }

  function init() {
    initScrollSpy();
    initClips();
    initLoopClips();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
