document.addEventListener("DOMContentLoaded", init);
window.addEventListener("pageshow", (event) => {
  // If the page is being restored from the BFCache, we need to re-apply the theme and language.
  if (event.persisted) {
    init();
  }
});

// Global click listener for anchors to ensure storage is updated before navigation
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (link && link.href) {
      // Check if it is a link we should care about (http/https/file)
      if (link.protocol === "http:" || link.protocol === "https:" || link.protocol === "file:") {
         // Save current state explicitly before navigation
         const currentLang = document.documentElement.getAttribute("lang") || "ar";
         const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
         localStorage.setItem("site-lang", currentLang);
         localStorage.setItem("site-theme", currentTheme);
      }
  }
});

function init() {
  const langBtn = document.getElementById("lang-switch");
  const themeBtn = document.getElementById("theme-switch");
  const html = document.documentElement;
  const body = document.body;

  // BroadcastChannel for cross-tab communication
  const syncChannel = new BroadcastChannel("edupath-sync");

  // 1. Initial State: Check URL params first (fixes file:// protocol issues), then storage
  const urlParams = new URLSearchParams(window.location.search);
  const paramLang = urlParams.get("lang");
  const paramTheme = urlParams.get("theme");

  const savedLang = paramLang || localStorage.getItem("site-lang") || "ar";
  const savedTheme = paramTheme || localStorage.getItem("site-theme") || "dark";

  // Persist URL params to storage to sync state
  if (paramLang) localStorage.setItem("site-lang", paramLang);
  if (paramTheme) localStorage.setItem("site-theme", paramTheme);

  applyLanguage(savedLang);
  applyTheme(savedTheme);

  // --- Handlers ---

  if (langBtn) {
    // Clone node to remove existing event listeners if init is called multiple times
    const newLangBtn = langBtn.cloneNode(true);
    langBtn.parentNode.replaceChild(newLangBtn, langBtn);
    
    newLangBtn.addEventListener("click", () => {
      const currentLang = html.getAttribute("lang");
      const newLang = currentLang === "ar" ? "en" : "ar";
      applyLanguage(newLang);
      localStorage.setItem("site-lang", newLang);
      updateLinks(); // Update links immediately
      // Broadcast to other tabs
      syncChannel.postMessage({ type: "language", value: newLang });
    });
  }

  if (themeBtn) {
    const newThemeBtn = themeBtn.cloneNode(true);
    themeBtn.parentNode.replaceChild(newThemeBtn, themeBtn);

    newThemeBtn.addEventListener("click", () => {
      const newTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(newTheme);
      localStorage.setItem("site-theme", newTheme);
      updateLinks(); // Update links immediately
      // Broadcast to other tabs
      syncChannel.postMessage({ type: "theme", value: newTheme });
    });
  }

  // --- Listen for messages from other tabs ---
  syncChannel.onmessage = (event) => {
    if (event.data.type === "language") {
      applyLanguage(event.data.value);
    } else if (event.data.type === "theme") {
      applyTheme(event.data.value);
    }
    // Update links whenever state changes from anywhere
    updateLinks();
  };

  // --- Helper Functions ---

  function applyLanguage(lang) {
    if (!lang) return;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    body.className = `lang-${lang}`;

    // Update button text - selecting fresh from DOM in case of replacement
    const currentLangBtn = document.getElementById("lang-switch");
    if (currentLangBtn) {
      currentLangBtn.textContent = lang === "ar" ? "English" : "العربية";
    }

    const currentThemeBtn = document.getElementById("theme-switch");
    if (currentThemeBtn) {
      currentThemeBtn.title = lang === "ar" ? "تبديل المظهر" : "Toggle Theme";
    }

    // Toggle content
    document.querySelectorAll("[data-en]").forEach((el) => {
      const content = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-ar");
      if (content && (content.includes('<') || el.children.length > 0)) {
        el.innerHTML = content;
      } else if (content) {
        el.textContent = content;
      }
    });

    // Update placeholders
    document.querySelectorAll("input[data-en-placeholder]").forEach((el) => {
      el.placeholder = lang === "en" ? el.getAttribute("data-en-placeholder") : el.getAttribute("data-ar-placeholder");
    });
    
    updateLinks();
  }

  function updateLinks() {
    const currentLang = html.getAttribute("lang") || "ar";
    const currentTheme = html.getAttribute("data-theme") || "dark";

    document.querySelectorAll("a").forEach(link => {
      // Only modify links that have an href and are not purely anchors or javascript
      if (link.href && !link.getAttribute("href").startsWith("#") && !link.getAttribute("href").startsWith("javascript:")) {
        try {
          const url = new URL(link.href);
          // Only update internal links (same origin)
          if (url.origin === window.location.origin || url.protocol === 'file:') {
             url.searchParams.set("lang", currentLang);
             url.searchParams.set("theme", currentTheme);
             link.href = url.toString();
          }
        } catch (e) {
          // Fallback or ignore invalid URLs
        }
      }
    });
  }

  function applyTheme(theme) {
    if (!theme) return;
    html.setAttribute("data-theme", theme);
    body.setAttribute("data-theme", theme);
  }
}
