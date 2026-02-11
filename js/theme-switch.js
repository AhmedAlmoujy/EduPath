// Lightweight theme switcher - optimized for file:// protocol URL params
(function() {
  const html = document.documentElement;
  // Check URL param first (for file:// persistence)
  const urlParams = new URLSearchParams(window.location.search);
  const paramTheme = urlParams.get("theme");
  const savedTheme = paramTheme || localStorage.getItem("site-theme") || "dark";
  
  // Apply theme immediately to html to prevent flash
  html.setAttribute("data-theme", savedTheme);
  
  // Apply to body when available (for GitHub Pages)
  if (document.body) {
    document.body.setAttribute("data-theme", savedTheme);
  } else {
    // Wait for body to be ready
    document.addEventListener("DOMContentLoaded", function() {
      document.body.setAttribute("data-theme", savedTheme);
    });
  }
  // Handle BFCache (back/forward button) restoration
  window.addEventListener("pageshow", function(event) {
    if (event.persisted) {
      const storedTheme = localStorage.getItem("site-theme") || "dark";
      html.setAttribute("data-theme", storedTheme);
      if (document.body) document.body.setAttribute("data-theme", storedTheme);
    }
  });

})();

