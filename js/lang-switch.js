document.addEventListener("DOMContentLoaded", init);
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    init();
  }
});

// Helper for safe storage access
const safeStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn("Storage access denied/failed", e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn("Storage write failed", e);
    }
  }
};

document.addEventListener("click", (e) => {
  try {
    const link = e.target.closest("a");
    if (link && link.href) {
        if (link.protocol === "http:" || link.protocol === "https:" || link.protocol === "file:") {
           const currentLang = document.documentElement.getAttribute("lang") || "ar";
           const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
           safeStorage.setItem("site-lang", currentLang);
           safeStorage.setItem("site-theme", currentTheme);
        }
    }
  } catch (e) {
    // Ignore click handler errors to not break navigation
    console.error("Link click handler error", e);
  }
});

function init() {
  try {
    const langBtn = document.getElementById("lang-switch");
    const themeBtn = document.getElementById("theme-switch");
    const html = document.documentElement;
    const body = document.body;

    let syncChannel;
    try {
      syncChannel = new BroadcastChannel("edupath-sync");
    } catch (e) {
      console.warn("BroadcastChannel not supported", e);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const paramLang = urlParams.get("lang");
    const paramTheme = urlParams.get("theme");

    const savedLang = paramLang || safeStorage.getItem("site-lang") || "ar";
    const savedTheme = paramTheme || safeStorage.getItem("site-theme") || "dark";

    if (paramLang) safeStorage.setItem("site-lang", paramLang);
    if (paramTheme) safeStorage.setItem("site-theme", paramTheme);

    applyLanguage(savedLang);
    applyTheme(savedTheme);

    if (langBtn) {
      const newLangBtn = langBtn.cloneNode(true);
      langBtn.parentNode.replaceChild(newLangBtn, langBtn);
      
      newLangBtn.addEventListener("click", () => {
        const currentLang = html.getAttribute("lang");
        const newLang = currentLang === "ar" ? "en" : "ar";
        applyLanguage(newLang);
        safeStorage.setItem("site-lang", newLang);
        updateLinks(); 
        if (syncChannel) syncChannel.postMessage({ type: "language", value: newLang });
      });
    }

    if (themeBtn) {
      const newThemeBtn = themeBtn.cloneNode(true);
      themeBtn.parentNode.replaceChild(newThemeBtn, themeBtn);

      newThemeBtn.addEventListener("click", () => {
        const newTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
        applyTheme(newTheme);
        safeStorage.setItem("site-theme", newTheme);
        updateLinks();
        if (syncChannel) syncChannel.postMessage({ type: "theme", value: newTheme });
      });
    }

    if (syncChannel) {
      syncChannel.onmessage = (event) => {
        if (event.data.type === "language") {
          applyLanguage(event.data.value);
        } else if (event.data.type === "theme") {
          applyTheme(event.data.value);
        }
        updateLinks();
      };
    }

    function applyLanguage(lang) {
      if (!lang) return;
      html.setAttribute("lang", lang);
      html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
      body.className = `lang-${lang}`;

      const currentLangBtn = document.getElementById("lang-switch");
      if (currentLangBtn) {
        currentLangBtn.textContent = lang === "ar" ? "English" : "العربية";
      }

      const currentThemeBtn = document.getElementById("theme-switch");
      if (currentThemeBtn) {
        currentThemeBtn.title = lang === "ar" ? "تبديل المظهر" : "Toggle Theme";
      }

      document.querySelectorAll("[data-en]").forEach((el) => {
        const content = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-ar");
        if (content && (content.includes('<') || el.children.length > 0)) {
          el.innerHTML = content;
        } else if (content) {
          el.textContent = content;
        }
      });

      document.querySelectorAll("input[data-en-placeholder]").forEach((el) => {
        el.placeholder = lang === "en" ? el.getAttribute("data-en-placeholder") : el.getAttribute("data-ar-placeholder");
      });
      
      updateLinks();
    }

    function updateLinks() {
      const currentLang = html.getAttribute("lang") || "ar";
      const currentTheme = html.getAttribute("data-theme") || "dark";

      document.querySelectorAll("a").forEach(link => {
        if (link.href && !link.getAttribute("href").startsWith("#") && !link.getAttribute("href").startsWith("javascript:")) {
          try {
            const url = new URL(link.href);
            if (url.origin === window.location.origin || url.protocol === 'file:') {
               url.searchParams.set("lang", currentLang);
               url.searchParams.set("theme", currentTheme);
               link.href = url.toString();
            }
          } catch (e) {
            // ignore
          }
        }
      });
    }

    function applyTheme(theme) {
      if (!theme) return;
      html.setAttribute("data-theme", theme);
      body.setAttribute("data-theme", theme);
    }
  } catch (e) {
    console.error("Initialization error", e);
  }
}
