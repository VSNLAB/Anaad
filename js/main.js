(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------
     NAV: scrolled state + mobile toggle
  --------------------------------------------------- */
  var nav = document.getElementById("site-nav");
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");

  function updateNav() {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  updateNav();

  navToggle.addEventListener("click", function () {
    var open = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---------------------------------------------------
     Reveal on scroll (IntersectionObserver)
  --------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal, .reveal-up");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------------------------------------------
     Hero curtain open + spotbeam, driven by hero scroll progress
  --------------------------------------------------- */
  var hero = document.getElementById("hero");
  var curtainLeft = document.querySelector(".curtain-left");
  var curtainRight = document.querySelector(".curtain-right");
  var heroBg = document.querySelector(".hero-bg-layer");
  var heroContent = document.querySelector(".hero-content");

  function heroProgress() {
    var rect = hero.getBoundingClientRect();
    var vh = window.innerHeight;
    // 0 at top of viewport, 1 once hero has scrolled fully past
    var p = 1 - (rect.bottom / (rect.height + vh));
    return Math.min(1, Math.max(0, p));
  }

  /* ---------------------------------------------------
     Parallax depth layers + reel tracker + curtains,
     all combined in a single rAF loop for performance
  --------------------------------------------------- */
  var depthEls = Array.prototype.slice.call(document.querySelectorAll("[data-depth]"));
  var reelFill = document.getElementById("reel-fill");
  var reelMM = document.getElementById("reel-mm");
  var reelSS = document.getElementById("reel-ss");
  var sprocket = document.querySelector(".reel-sprocket");

  var ticking = false;

  function render() {
    ticking = false;
    var scrollY = window.scrollY || window.pageYOffset;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docH > 0 ? scrollY / docH : 0;

    updateNav();

    // Curtain open — first ~70% of hero's own scroll progress
    if (curtainLeft && curtainRight) {
      var hp = heroProgress();
      var curtainP = Math.min(1, hp / 0.62);
      if (!reduceMotion) {
        var angle = curtainP * 92; // degrees
        var tx = curtainP * 6; // % extra slide
        curtainLeft.style.transform =
          "perspective(1400px) rotateY(-" + angle + "deg) translateX(-" + tx + "%)";
        curtainRight.style.transform =
          "perspective(1400px) rotateY(" + angle + "deg) translateX(" + tx + "%)";
        curtainLeft.style.opacity = curtainP > 0.92 ? Math.max(0, 1 - (curtainP - 0.92) / 0.08) : 1;
        curtainRight.style.opacity = curtainLeft.style.opacity;
      } else {
        curtainLeft.style.transform = "translateX(-100%)";
        curtainRight.style.transform = "translateX(100%)";
      }

      if (heroBg && !reduceMotion) {
        heroBg.style.transform = "translateY(" + hp * 12 + "%) scale(" + (1 + hp * 0.08) + ")";
      }
      if (heroContent && !reduceMotion) {
        heroContent.style.transform = "translateY(" + hp * -6 + "%)";
        heroContent.style.opacity = String(Math.max(0, 1 - hp * 1.6));
      }
    }

    // Parallax depth layers
    if (!reduceMotion) {
      depthEls.forEach(function (el) {
        var depth = parseFloat(el.getAttribute("data-depth")) || 0.1;
        var rect = el.getBoundingClientRect();
        var centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
        var move = centerOffset * depth * -0.35;
        el.style.transform = "translate3d(0," + move + "px,0)";
      });
    }

    // Reel timecode tracker
    if (reelFill) {
      reelFill.style.height = (progress * 100) + "%";
      var totalSeconds = Math.round(progress * 24 * 60); // 24:00 "runtime"
      var mm = Math.floor(totalSeconds / 60);
      var ss = totalSeconds % 60;
      reelMM.textContent = String(mm).padStart(2, "0");
      reelSS.textContent = String(ss).padStart(2, "0");
      if (sprocket) {
        sprocket.classList.toggle("paused", Math.abs(scrollY - (render._lastY || 0)) < 0.5);
      }
    }
    render._lastY = scrollY;
  }

  function requestTick() {
    if (!ticking) {
      window.requestAnimationFrame(render);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  render();

  /* ---------------------------------------------------
     Spotlight cursor
  --------------------------------------------------- */
  if (!reduceMotion && window.matchMedia("(hover:hover)").matches) {
    var spot = document.querySelector(".spotlight-cursor");
    window.addEventListener(
      "mousemove",
      function (e) {
        spot.style.setProperty("--mx", e.clientX + "px");
        spot.style.setProperty("--my", e.clientY + "px");
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------
     3D tilt on hover for cards / feature images
  --------------------------------------------------- */
  if (!reduceMotion && window.matchMedia("(hover:hover)").matches) {
    var tiltEls = document.querySelectorAll("[data-tilt], [data-tilt-strong]");
    tiltEls.forEach(function (el) {
      var strength = el.hasAttribute("data-tilt-strong") ? 14 : 7;
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform =
          "perspective(900px) rotateX(" + (py * -strength) + "deg) rotateY(" + (px * strength) + "deg) translateZ(6px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateZ(0)";
      });
    });
  }

  /* ---------------------------------------------------
     Smooth-scroll for in-page nav links (respects header offset)
  --------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });
})();
