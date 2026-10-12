/* ==========================================================
   Documentation projet Leads — script partagé
   Pour ajouter une page au menu : ajouter une ligne dans PAGES.
   ========================================================== */
(function () {
  "use strict";

  var PAGES = [
    { id: "accueil", href: "index.html", label: "Accueil", num: "00" },
    { id: "commandes", href: "commandes.html", label: "Commandes", num: "01" },
    { id: "speech", href: "speech.html", label: "Speech", num: "02" },
    { id: "architecture", href: "architecture.html", label: "Architecture", num: "03" },
    { id: "depannage", href: "depannage.html", label: "Dépannage", num: "04" }
  ];

  var current = document.body.getAttribute("data-page");

  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) {}
    return null;
  }

  /* ---------- Menu ---------- */
  var host = document.getElementById("app-nav");
  if (host) {
    var links = PAGES.map(function (p) {
      return (
        '<a class="nav-link' + (p.id === current ? " active" : "") + '" href="' + p.href + '">' +
        '<span class="num">' + p.num + "</span>" + p.label + "</a>"
      );
    }).join("");

    host.innerHTML =
      '<div class="topbar">' +
      '<button class="burger" id="burger" aria-label="Ouvrir le menu">&#9776;</button>' +
      "<strong>Projet Leads</strong></div>" +
      '<div class="overlay" id="overlay"></div>' +
      '<aside class="sidebar" id="sidebar">' +
      '<a class="brand" href="index.html"><span class="brand-mark">L</span>' +
      '<span class="brand-text"><strong>Projet Leads</strong><span>Documentation</span></span></a>' +
      '<nav class="nav"><div class="nav-label">Pages</div>' + links + "</nav>" +
      '<div class="sidebar-foot">' +
      '<button class="theme-btn" id="theme-btn"><span id="theme-ico"></span><span id="theme-txt"></span></button>' +
      '<div class="foot-note">Soutenance de mémoire</div></div></aside>';

    var sidebar = document.getElementById("sidebar");
    var overlay = document.getElementById("overlay");
    var closeMenu = function () {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    };
    document.getElementById("burger").addEventListener("click", function () {
      sidebar.classList.add("open");
      overlay.classList.add("show");
    });
    overlay.addEventListener("click", closeMenu);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    /* Thème clair / sombre */
    var root = document.documentElement;
    var paintTheme = function () {
      var dark = root.getAttribute("data-theme") === "dark";
      document.getElementById("theme-ico").textContent = dark ? "☀" : "☾";
      document.getElementById("theme-txt").textContent = dark ? "Mode clair" : "Mode sombre";
    };
    document.getElementById("theme-btn").addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      store("theme", next);
      paintTheme();
    });
    paintTheme();
  }

  /* ---------- Blocs de commande avec bouton Copier ---------- */
  document.querySelectorAll(".cmd").forEach(function (box) {
    var label = box.getAttribute("data-label") || "Terminal";
    var head = document.createElement("div");
    head.className = "cmd-head";
    head.innerHTML = "<span>" + label + '</span><button class="copy" type="button">Copier</button>';
    box.insertBefore(head, box.firstChild);

    head.querySelector(".copy").addEventListener("click", function (e) {
      var btn = e.currentTarget;
      var text = box.querySelector("pre").innerText.trim();
      var done = function () {
        btn.textContent = "Copié ✓";
        btn.classList.add("done");
        setTimeout(function () {
          btn.textContent = "Copier";
          btn.classList.remove("done");
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (err) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- Filtre de commandes ---------- */
  var search = document.getElementById("filter");
  if (search) {
    var items = Array.prototype.slice.call(document.querySelectorAll(".cmd-item"));
    var counter = document.getElementById("count");
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (it) {
        var match = !q || it.textContent.toLowerCase().indexOf(q) !== -1;
        it.hidden = !match;
        if (match) shown++;
      });
      counter.textContent = q ? shown + " résultat" + (shown > 1 ? "s" : "") : "";
    });
  }

  /* ---------- Cases à cocher mémorisées ---------- */
  document.querySelectorAll("input[data-key]").forEach(function (cb) {
    var key = "check:" + cb.getAttribute("data-key");
    cb.checked = store(key) === "1";
    cb.addEventListener("change", function () {
      store(key, cb.checked ? "1" : "0");
    });
  });

  /* ---------- Sommaire (pills) actif au scroll ---------- */
  var pills = document.querySelectorAll(".pill[data-target]");
  if (pills.length && "IntersectionObserver" in window) {
    var map = {};
    pills.forEach(function (p) { map[p.getAttribute("data-target")] = p; });
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            pills.forEach(function (p) { p.classList.remove("on"); });
            var p = map[en.target.id];
            if (p) p.classList.add("on");
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  }

  /* ---------- Page Speech : durée de lecture, taille, mode focus ---------- */
  var blocks = document.querySelectorAll(".speech-block");
  if (blocks.length) {
    var WPM = 130; /* débit de parole moyen, mots par minute */
    var totalSec = 0;
    blocks.forEach(function (b) {
      var words = 0;
      b.querySelectorAll(".say").forEach(function (s) {
        words += (s.textContent.trim().match(/\S+/g) || []).length;
      });
      var sec = Math.round((words / WPM) * 60);
      totalSec += sec;
      var out = b.querySelector(".rt");
      if (out) out.textContent = "≈ " + fmt(sec) + " à l'oral";
    });
    var total = document.getElementById("total");
    if (total) total.innerHTML = "Durée totale estimée : <strong>" + fmt(totalSec) + "</strong>";

    function fmt(sec) {
      var m = Math.floor(sec / 60);
      var s = sec % 60;
      return m + " min " + (s < 10 ? "0" : "") + s;
    }

    var size = parseInt(store("say-size") || "18", 10);
    var applySize = function () {
      document.documentElement.style.setProperty("--say-size", size + "px");
      store("say-size", String(size));
    };
    applySize();
    document.getElementById("fs-minus").addEventListener("click", function () {
      size = Math.max(14, size - 2);
      applySize();
    });
    document.getElementById("fs-plus").addEventListener("click", function () {
      size = Math.min(34, size + 2);
      applySize();
    });

    var focusBtn = document.getElementById("focus");
    var toggleFocus = function () {
      var on = document.body.classList.toggle("focus");
      focusBtn.textContent = on ? "Quitter le mode lecture" : "Mode lecture";
    };
    focusBtn.addEventListener("click", toggleFocus);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("focus")) toggleFocus();
    });
  }
})();
