// Lightweight theme switcher - optimized for file:// protocol URL params
(function() {
  const html = document.documentElement;
  // Check URL param first (for file:// persistence)
  const urlParams = new URLSearchParams(window.location.search);
  const paramTheme = urlParams.get("theme");
  const savedTheme = paramTheme || localStorage.getItem("site-theme") || "dark";
  
  // Apply theme immediately to prevent flash
  html.setAttribute("data-theme", savedTheme);
  if (document.body) {
    document.body.setAttribute("data-theme", savedTheme);
  }
})();
