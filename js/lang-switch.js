document.addEventListener("DOMContentLoaded", () => {
  const langBtn = document.getElementById("lang-switch");
  const themeBtn = document.getElementById("theme-switch");
  const html = document.documentElement;
  const body = document.body;

  // BroadcastChannel for cross-tab communication
  const syncChannel = new BroadcastChannel("edupath-sync");

  // 1. Initial State: Check URL params first (fixes file:// protocol issues), then storage
  const urlParams = new URLSearchParams(window.location.search);
  const paramLang = urlParams.get("lang");
  const paramTheme = urlParams.get("theme"); // Capture theme from URL
  
  const savedLang = paramLang || localStorage.getItem("site-lang") || "ar";
  const savedTheme = paramTheme || localStorage.getItem("site-theme") || "dark";
  
  // Persist URL params to storage to sync state
  if (paramLang) localStorage.setItem("site-lang", paramLang);
  if (paramTheme) localStorage.setItem("site-theme", paramTheme);

  applyLanguage(savedLang);
  applyTheme(savedTheme);

  // --- Handlers ---

  if (langBtn) {
    langBtn.addEventListener("click", () => {
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
    themeBtn.addEventListener("click", () => {
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

    if (langBtn) {
      langBtn.textContent = lang === "ar" ? "English" : "العربية";
    }

    if (themeBtn) {
      themeBtn.title = lang === "ar" ? "تبديل المظهر" : "Toggle Theme";
    }

    // Toggle content - use textContent for simple text, innerHTML for HTML content
    document.querySelectorAll("[data-en]").forEach((el) => {
      const content = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-ar");
      // Check if content contains HTML tags
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
    
    // Update all navigation links to carry valid state
    updateLinks();
  }

  function updateLinks() {
    // Get current state from DOM to ensure we have latest values
    const currentLang = html.getAttribute("lang") || "ar";
    const currentTheme = html.getAttribute("data-theme") || "dark";

    document.querySelectorAll("a").forEach(link => {
      const href = link.getAttribute("href");
      // Only modify internal .html links or base paths
      if (href && (href.endsWith('.html') || href === '#' || (!href.startsWith('http') && !href.startsWith('mailto')))) {
        try {
          // Construct new URL with params
          const url = new URL(link.href); // link.href is absolute
          url.searchParams.set("lang", currentLang);
          url.searchParams.set("theme", currentTheme);
          link.href = url.toString();
        } catch (e) {
          // Fallback relative string manipulation if URL parsing fails
          if (!href.includes('script:')) {
             // Remove existing params first to avoid duplicates if called multiple times improperly
             const base = href.split('?')[0];
             link.setAttribute('href', `${base}?lang=${currentLang}&theme=${currentTheme}`);
          }
        }
      }
    });
  }

  function applyTheme(theme) {
    if (!theme) return;
    html.setAttribute("data-theme", theme);
    // Ensure body also knows about the theme if needed for specific CSS overrides
    body.setAttribute("data-theme", theme);
  }
});
