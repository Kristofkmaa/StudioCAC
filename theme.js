// Bouton clair / sombre : bascule data-theme sur <html>, mémorise le choix et suit le système tant que rien n'est choisi.
(() => {
  const KEY = "saitora-theme", root = document.documentElement;
  const sys = matchMedia("(prefers-color-scheme: dark)");
  const stored = () => { try { return localStorage.getItem(KEY); } catch (_) { return null; } };
  const meta = document.querySelector('meta[name="theme-color"]');

  function apply(t) {
    root.classList.add("theme-switching");
    root.dataset.theme = t;
    if (meta) meta.content = t === "dark" ? "#0C0C0D" : "#FAFAF9";
    document.querySelectorAll("[data-theme-toggle]").forEach(b => {
      b.setAttribute("aria-pressed", t === "dark");
      b.setAttribute("aria-label", t === "dark" ? "Passer au thème clair" : "Passer au thème sombre");
    });
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
  }
  const sync = () => apply(stored() || (sys.matches ? "dark" : "light"));

  document.addEventListener("click", e => {
    if (!e.target.closest("[data-theme-toggle]")) return;
    const t = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem(KEY, t); } catch (_) {}
    apply(t);
  });
  sys.addEventListener("change", () => { if (!stored()) sync(); });
  addEventListener("pageshow", e => { if (e.persisted) sync(); });   // choix fait sur une autre page, puis retour
  sync();
})();
