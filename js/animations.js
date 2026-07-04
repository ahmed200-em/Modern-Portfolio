/* =========================================================
   Ahmed Elmakrini — Portfolio
   Animations: scroll reveal, typing, progress bars, counters
   ========================================================= */

(function () {
  "use strict";

  // ---------- Scroll Reveal using IntersectionObserver ----------
  function initScrollReveal() {
    const elements = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger",
    );

    if (!("IntersectionObserver" in window)) {
      // Fallback: show everything
      elements.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    elements.forEach((el) => observer.observe(el));
  }
  /* ============================================
   Sticky Header & Scroll Progress
   ============================================ */

  function handleScroll() {
    const scrollY = window.scrollY;
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollY / docHeight) * 100;

    // Sticky header
    header.classList.toggle("scrolled", scrollY > 50);

    // Scroll progress bar
    scrollProgress.style.width = `${scrollPercent}%`;

    // Scroll to top button
    scrollTopBtn.classList.toggle("visible", scrollY > 400);

    // Active navigation link
    updateActiveNav();
  }

  window.addEventListener("scroll", handleScroll, { passive: true });

  /* ============================================
   Active Navigation on Scroll
   ============================================ */

  function updateActiveNav() {
    const sections = document.querySelectorAll("section[id]");
    const scrollPos = window.scrollY + 120;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }
  // ---------- Typing Animation ----------
  function initTyping() {
    const el = document.querySelector(".typing-text");
    if (!el) return;

    const words = JSON.parse(el.getAttribute("data-words") || "[]");
    if (!words.length) return;

    const typeSpeed = 90;
    const eraseSpeed = 50;
    const pauseAfterType = 1800;
    const pauseAfterErase = 400;
    let wordIndex = 0;
    let charIndex = 0;
    let isErasing = false;

    function tick() {
      const current = words[wordIndex];

      if (!isErasing) {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === current.length) {
          isErasing = true;
          setTimeout(tick, pauseAfterType);
          return;
        }
        setTimeout(tick, typeSpeed);
      } else {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isErasing = false;
          wordIndex = (wordIndex + 1) % words.length;
          setTimeout(tick, pauseAfterErase);
          return;
        }
        setTimeout(tick, eraseSpeed);
      }
    }

    // Start after a small delay
    setTimeout(tick, 600);
  }

  // ---------- Animated Skill Progress Bars ----------
  function initSkillBars() {
    const bars = document.querySelectorAll(".skill-progress-bar");
    if (!bars.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const bar = entry.target;
            const value = bar.getAttribute("data-value") || "0";
            requestAnimationFrame(() => {
              bar.style.width = value + "%";
            });
            observer.unobserve(bar);
          }
        });
      },
      { threshold: 0.5 },
    );

    bars.forEach((bar) => observer.observe(bar));
  }

  // ---------- Active Section Highlighting (scroll spy) ----------
  function initScrollSpy() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    if (!sections.length || !navLinks.length) return;

    function update() {
      const scrollY = window.scrollY + 120;

      let currentId = "";
      sections.forEach((section) => {
        if (scrollY >= section.offsetTop) {
          currentId = section.id;
        }
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === "#" + currentId) {
          link.classList.add("active");
        } else {
          link.classList.remove("active");
        }
      });
    }

    let ticking = false;
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            update();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true },
    );

    update();
  }

  // ---------- Scroll Progress Bar ----------
  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress");
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + "%";
    }

    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  // ---------- Scroll-to-top button ----------
  function initScrollTopButton() {
    const btn = document.querySelector(".scroll-top");
    if (!btn) return;

    function toggle() {
      if (window.scrollY > 400) {
        btn.classList.add("visible");
      } else {
        btn.classList.remove("visible");
      }
    }

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
  }

  // ---------- Sticky Navbar (adds .scrolled when needed) ----------
  function initStickyNav() {
    const nav = document.querySelector(".navbar");
    if (!nav) return;

    function toggle() {
      if (window.scrollY > 30) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    }

    window.addEventListener("scroll", toggle, { passive: true });
    toggle();
  }

  // ---------- Loader ----------
  function initLoader() {
    const loader = document.querySelector(".loader");
    if (!loader) return;

    window.addEventListener("load", () => {
      setTimeout(() => {
        loader.classList.add("hidden");
        setTimeout(() => loader.remove(), 700);
      }, 400);
    });

    // Safety: hide after 2.5s no matter what
    setTimeout(() => {
      loader.classList.add("hidden");
      setTimeout(() => loader && loader.remove(), 700);
    }, 2500);
  }

  // ---------- 3D Tilt on Project Cards ----------
  function initTiltEffect() {
    const cards = document.querySelectorAll(".tilt-on-hover");
    if (!cards.length) return;

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  // ---------- Init all ----------
  function init() {
    initLoader();
    initScrollReveal();
    initTyping();
    initSkillBars();
    initScrollSpy();
    initScrollProgress();
    initScrollTopButton();
    initStickyNav();
    initTiltEffect();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

