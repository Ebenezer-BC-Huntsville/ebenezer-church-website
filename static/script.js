(function () {
  "use strict";

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    Array.prototype.forEach.call(nav.querySelectorAll("a"), function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Scroll fade-ins
  var faders = document.querySelectorAll(".fade-in");
  if ("IntersectionObserver" in window && faders.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    faders.forEach(function (el) { observer.observe(el); });
  } else {
    faders.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  // Contact form submission (progressive enhancement — falls back to a
  // normal POST to /contact if JS fails)
  var form = document.getElementById("contact-form");
  if (form) {
    var status = form.querySelector(".form-status");
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      status.removeAttribute("data-state");
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending\u2026";

      fetch(form.getAttribute("action") || "/contact", {
        method: "POST",
        body: new FormData(form),
        headers: { "Accept": "application/json" }
      })
        .then(function (res) {
          return res.json().then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (result) {
          if (result.ok && result.data.ok) {
            status.textContent = "Thank you \u2014 your message has been sent. We'll be in touch soon.";
            status.setAttribute("data-state", "ok");
            form.reset();
          } else {
            status.textContent = (result.data && result.data.error) || "Something went wrong. Please try again.";
            status.setAttribute("data-state", "error");
          }
        })
        .catch(function () {
          status.textContent = "Something went wrong. Please check your connection and try again.";
          status.setAttribute("data-state", "error");
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = "Send Message";
        });
    });
  }
})();
