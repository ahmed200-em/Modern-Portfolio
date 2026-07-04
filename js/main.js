/* =========================================================
   Ahmed Elmakrini — Portfolio
   Main JS: nav, contact form, mobile menu, misc
   ========================================================= */

(function () {
  "use strict";

  /* ============================================
     Mobile Navigation
     ============================================ */
  function initMobileNav() {
    const navToggle = document.querySelector(".nav-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    if (!navToggle || !navMenu) return;

    let navOverlay = document.querySelector(".nav-overlay");
    if (!navOverlay) {
      navOverlay = document.createElement("div");
      navOverlay.className = "nav-overlay";
      document.body.appendChild(navOverlay);
    }

    const toggleNav = () => {
      const isOpen = navMenu.classList.toggle("open");
      navToggle.classList.toggle("active", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navOverlay.classList.toggle("active", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    };

    const closeNav = () => {
      navMenu.classList.remove("open");
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
      navOverlay.classList.remove("active");
      document.body.style.overflow = "";
    };

    navToggle.addEventListener("click", toggleNav);
    navOverlay.addEventListener("click", closeNav);
    navLinks.forEach((link) => link.addEventListener("click", closeNav));

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) closeNav();
    });
  }

  // ---------- Smooth scroll for anchor links ----------
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");
        if (!href || href === "#") return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const navHeight =
          parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
              "--nav-height",
            ),
          ) || 72;

        const top =
          target.getBoundingClientRect().top + window.scrollY - navHeight + 1;

        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  }

  // ---------- Contact Form ----------
  function initContactForm() {
    const form = document.querySelector(".contact-form");
    if (!form) return;

    const status = form.querySelector(".form-status");

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const message = form.querySelector('[name="message"]').value.trim();

      if (!name || !email || !message) {
        if (status) {
          status.style.color = "#ef4444";
          status.textContent = "Please fill in all fields.";
        }
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (status) {
          status.style.color = "#ef4444";
          status.textContent = "Please enter a valid email address.";
        }
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = "<span>Sending…</span>";
      submitBtn.disabled = true;

      setTimeout(() => {
        if (status) {
          status.style.color = "#22c55e";
          status.textContent =
            "✓ Thanks " + name + "! Your message has been sent. I will reply soon.";
        }
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        setTimeout(() => {
          if (status) status.textContent = "";
        }, 6000);
      }, 1100);
    });
  }

  // ---------- Year auto-update ----------
  function initYear() {
    const yearEl = document.querySelector("[data-year]");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  // ---------- Init ----------
  function init() {
    initMobileNav();
    initSmoothScroll();
    initContactForm();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();