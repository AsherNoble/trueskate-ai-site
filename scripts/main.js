/* ============================================================
   TrueSkate-AI — main.js
   Core behaviour: scroll-reveal, graceful video fallback,
   nav scrollspy, reduced-motion handling.
   No browser-storage APIs are used anywhere.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!els.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Graceful video fallback ----------
     Every [data-clip] holds a <video> over a placeholder. If the
     source can't load (e.g. the .mp4 isn't present yet), reveal the
     placeholder by adding .clip--empty. */
  function initClips() {
    var clips = Array.prototype.slice.call(document.querySelectorAll("[data-clip]"));
    clips.forEach(function (clip) {
      var video = clip.querySelector(".clip__video");
      if (!video) { clip.classList.add("clip--empty"); return; }

      function markEmpty() { clip.classList.add("clip--empty"); }

      video.addEventListener("error", markEmpty, true);
      var sources = video.querySelectorAll("source");
      sources.forEach(function (s) { s.addEventListener("error", markEmpty); });

      // Fallback probe: if nothing has loaded shortly after mount, the
      // file is missing (NETWORK_NO_SOURCE) — show the placeholder.
      window.setTimeout(function () {
        if (video.networkState === 3 /* NETWORK_NO_SOURCE */ ||
            (video.readyState === 0 && video.networkState === 2 && !video.videoWidth)) {
          // give a little more grace for slow networks before giving up
          window.setTimeout(function () {
            if (video.readyState < 2) markEmpty();
          }, 2500);
        }
      }, 1400);

      if (reduceMotion) {
        video.removeAttribute("autoplay");
        try { video.pause(); } catch (e) {}
      }
    });
  }

  /* ---------- Nav scrollspy ---------- */
  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll("[data-nav-link]"));
    if (!links.length || !("IntersectionObserver" in window)) return;

    var map = {};
    var sections = [];
    links.forEach(function (link) {
      var id = (link.getAttribute("href") || "").replace("#", "");
      var sec = id && document.getElementById(id);
      if (sec) { map[id] = link; sections.push(sec); }
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

    sections.forEach(function (sec) { spy.observe(sec); });
  }

  /* ---------- Expose reduced-motion flag for diagram module ---------- */
  window.__TSAI__ = { reduceMotion: reduceMotion };

  function init() {
    initReveal();
    initClips();
    initScrollSpy();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
