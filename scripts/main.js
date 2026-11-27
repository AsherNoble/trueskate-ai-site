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

  /* ---------- Sticky mobile navigation ---------- */
  function initMobileMenu() {
    var header = document.querySelector(".doc-sidebar");
    var toggle = header && header.querySelector(".doc-menu-toggle");
    var nav = header && header.querySelector(".doc-nav");
    if (!header || !toggle || !nav) return;
    var mobile = window.matchMedia("(max-width:860px)");
    var lastY = Math.max(0, window.scrollY), travel = 0, direction = 0;
    var queued = false, navigating = false, navigationTimer;
    function show() { header.classList.remove("is-header-hidden"); }
    function setOpen(open) {
      header.classList.toggle("is-menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close sections menu" : "Open sections menu");
      if (open) show();
    }
    function measure() {
      if (mobile.matches) document.documentElement.style.setProperty("--mobile-header-height", header.offsetHeight + "px");
    }
    function setMode() {
      setOpen(false);
      navigating = false;
      clearTimeout(navigationTimer);
      show();
      header.classList.toggle("is-mobile-menu-ready", mobile.matches);
      lastY = Math.max(0, window.scrollY);
      travel = direction = 0;
      measure();
    }
    function onScroll() {
      queued = false;
      var y = Math.max(0, window.scrollY);
      var delta = y - lastY;
      lastY = y;
      if (!mobile.matches) return;
      if (navigating) {
        show();
        clearTimeout(navigationTimer);
        navigationTimer = setTimeout(function () { navigating = false; }, 180);
        return;
      }
      if (y <= 8) {
        show();
        travel = direction = 0;
        return;
      }
      if (!delta) return;
      var nextDirection = delta > 0 ? 1 : -1;
      if (nextDirection !== direction) { travel = 0; direction = nextDirection; }
      travel += Math.abs(delta);
      if (direction > 0 && y > header.offsetHeight && travel >= 24) {
        setOpen(false);
        header.classList.add("is-header-hidden");
      }
      if (direction < 0 && travel >= 12) show();
    }
    window.addEventListener("scroll", function () {
      if (!queued) { queued = true; requestAnimationFrame(onScroll); }
    }, {passive: true});
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (event) {
      if (mobile.matches && event.target.closest("a")) {
        setOpen(false);
        navigating = true;
        clearTimeout(navigationTimer);
        navigationTimer = setTimeout(function () { navigating = false; }, 500);
        travel = direction = 0;
      }
    });
    document.addEventListener("pointerdown", function (event) {
      if (mobile.matches && !header.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (mobile.matches && event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    header.addEventListener("focusin", function () { if (mobile.matches) show(); });
    mobile.addEventListener("change", setMode);
    window.addEventListener("resize", measure, {passive:true});
    if ("ResizeObserver" in window) new ResizeObserver(measure).observe(header);
    setMode();
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

  /* ---------- Mobile inverse-dynamics carousel ---------- */
  function initReelCarousel() {
    var reel = document.querySelector(".doc-figs--reels");
    if (!reel || !("IntersectionObserver" in window)) return;
    var slides = Array.from(reel.querySelectorAll("[data-loop]"));
    var videos = slides.map(function (slide) { return slide.querySelector("video"); });
    var mobile = window.matchMedia("(max-width:640px)");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var active = 0, visible = false, scrolling = false, userPaused = false, timer;
    var nav = document.createElement("div");
    nav.className = "doc-reel-nav";
    nav.setAttribute("aria-label", "Video carousel");
    var dots = slides.map(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Show video " + (i + 1));
      dot.addEventListener("click", function () { go(i); });
      nav.appendChild(dot);
      return dot;
    });
    reel.after(nav);

    function markActive() {
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-current", i === active ? "true" : "false");
      });
    }

    function syncPlayback() {
      if (!mobile.matches) return;
      videos.forEach(function (v, i) {
        if (i !== active || !visible || scrolling || userPaused) {
          v.pause();
        } else {
          if (v.ended) v.currentTime = 0;
          var play = v.play();
          if (play && play.catch) play.catch(function () {});
        }
      });
    }

    function settle() {
      if (!mobile.matches) return;
      clearTimeout(timer);
      var next = Math.max(0, Math.min(slides.length - 1, Math.round(reel.scrollLeft / reel.clientWidth)));
      if (next !== active) {
        active = next;
        userPaused = false;
        if (videos[active].readyState) videos[active].currentTime = 0;
      }
      scrolling = false;
      markActive();
      syncPlayback();
    }

    function go(next) {
      if (!mobile.matches) return;
      next = (next + slides.length) % slides.length;
      if (next === active && !scrolling) return;
      scrolling = true;
      syncPlayback();
      var wrap = active === slides.length - 1 && next === 0 || active === 0 && next === slides.length - 1;
      reel.scrollTo({left: next * reel.clientWidth, behavior: reducedMotion.matches || wrap ? "instant" : "smooth"});
      clearTimeout(timer);
      timer = setTimeout(settle, 180);
    }

    reel.addEventListener("scroll", function () {
      if (!mobile.matches) return;
      if (!scrolling) { scrolling = true; syncPlayback(); }
      clearTimeout(timer);
      timer = setTimeout(settle, 140);
    }, {passive: true});
    reel.addEventListener("scrollend", settle);
    reel.addEventListener("keydown", function (event) {
      if (!mobile.matches) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        go(active + (event.key === "ArrowRight" ? 1 : -1));
      }
    });
    videos.forEach(function (v, i) {
      v.addEventListener("ended", function () {
        if (mobile.matches && i === active && visible && !userPaused) go(active + 1);
      });
      slides[i].querySelector("button").addEventListener("click", function () {
        if (mobile.matches && i === active) userPaused = v.paused;
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      syncPlayback();
    }, {threshold: 0.2});
    observer.observe(reel);

    function setMode() {
      clearTimeout(timer);
      scrolling = false;
      userPaused = false;
      if (mobile.matches) {
        reel.tabIndex = 0;
        videos.forEach(function (v) { v.autoplay = false; v.loop = false; v.pause(); });
        reel.scrollLeft = active * reel.clientWidth;
        settle();
      } else {
        reel.removeAttribute("tabindex");
        reel.scrollLeft = 0;
        videos.forEach(function (v) { v.autoplay = true; v.loop = true; });
        if (visible) videos.forEach(function (v) { var play = v.play(); if (play && play.catch) play.catch(function () {}); });
      }
    }
    mobile.addEventListener("change", setMode);
    markActive();
    setMode();
  }

  /* ---------- Full-screen still-image gallery ---------- */
  function initGallery() {
    var images = Array.from(document.querySelectorAll("figure .doc-frame > img"));
    if (!images.length) return;
    var dialog = document.createElement("dialog");
    dialog.className = "doc-gallery";
    dialog.setAttribute("aria-label", "Image gallery");
    dialog.innerHTML = '<div class="doc-gallery__bar"><span data-gallery-count aria-live="polite"></span><button class="doc-gallery__button" type="button" data-close aria-label="Close gallery">×</button></div>' +
      '<div class="doc-gallery__stage"><button class="doc-gallery__button" type="button" data-prev aria-label="Previous image">←</button><img class="doc-gallery__image" alt=""><button class="doc-gallery__button" type="button" data-next aria-label="Next image">→</button></div>' +
      '<div class="doc-gallery__caption"></div>';
    document.body.appendChild(dialog);
    var current = 0;
    var opener;
    var displayed = dialog.querySelector("img");
    function show(index) {
      current = (index + images.length) % images.length;
      var image = images[current];
      displayed.src = image.currentSrc || image.src;
      displayed.alt = image.alt;
      dialog.querySelector("[data-gallery-count]").textContent = (current + 1) + " / " + images.length;
      dialog.querySelector(".doc-gallery__caption").textContent = image.closest("figure").querySelector("figcaption").innerText;
    }
    images.forEach(function (image, index) {
      image.dataset.gallery = "";
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      function open() {
        opener = image;
        show(index);
        dialog.showModal();
        dialog.querySelector("[data-close]").focus();
      }
      image.addEventListener("click", open);
      image.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      });
    });
    dialog.querySelector("[data-close]").addEventListener("click", function () { dialog.close(); });
    dialog.querySelector("[data-prev]").addEventListener("click", function () { show(current - 1); });
    dialog.querySelector("[data-next]").addEventListener("click", function () { show(current + 1); });
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        show(current + (event.key === "ArrowRight" ? 1 : -1));
      }
    });
    dialog.addEventListener("close", function () { if (opener) opener.focus({preventScroll:true}); });
  }

  function init() {
    initScrollSpy();
    initMobileMenu();
    initClips();
    initLoopClips();
    initReelCarousel();
    initGallery();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
