document.addEventListener("DOMContentLoaded", init);
window.addEventListener("pageshow", (event) => {
  // If the page is being restored from the BFCache, we need to re-apply the theme and language.
  if (event.persisted) {
    init();
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
      const href = link.getAttribute("href");
      if (href && (href.endsWith('.html') || href === '#' || (!href.startsWith('http') && !href.startsWith('mailto')))) {
        try {
          // Check if it's already a full URL or relative
          const url = new URL(link.href, window.location.origin);
          url.searchParams.set("lang", currentLang);
          url.searchParams.set("theme", currentTheme);
          link.href = url.toString();
        } catch (e) {
          // Fallback
          console.error("Failed to update link:", href, e);
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
