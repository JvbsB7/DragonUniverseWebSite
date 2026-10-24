(function () {
  var L = window.DU_LINKS || {};
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Links de config.js (download, apoio); Discord e GitHub têm href no HTML. Sem URL: vira botão desativado "Em breve" (nunca link quebrado).
  $$("[data-link]").forEach(function (a) {
    var url = L[a.dataset.link], rot = a.dataset.rotulo;
    if (url) {
      if (a.hasAttribute("href")) return; // destino literal no HTML (Discord, GitHub)
      a.href = url;
      if (/^https?:/.test(url)) { a.target = "_blank"; a.rel = "noopener noreferrer"; a.setAttribute("aria-label", rot + " (abre em nova aba)"); }
      return;
    }
    var b = document.createElement("button");
    b.type = "button"; b.disabled = true; b.className = a.className;
    b.textContent = "Em breve";
    b.setAttribute("aria-label", rot + ": em breve, ainda sem link disponível");
    a.replaceWith(b);
    $$('[data-apoio="' + a.dataset.link + '"]').forEach(function (n) { n.hidden = false; });
  });

  // Menu mobile
  var btnMenu = document.querySelector(".btn-menu"), menu = document.getElementById("menu");
  function menuAberto() { return menu.classList.contains("aberto"); }
  // Menu modal: o fundo fica inerte enquanto aberto
  var fundo = $$(".aviso-topo, .pular, main, footer, #barra, .cabecalho .marca, .btn-menu");
  function setMenu(abrir, semFoco) {
    fundo.forEach(function (n) { n.inert = abrir; });
    menu.classList.toggle("aberto", abrir);
    btnMenu.setAttribute("aria-expanded", abrir);
    document.body.style.overflow = abrir ? "hidden" : "";
    if (abrir) menu.querySelector("[data-fechar-menu]").focus(); else if (!semFoco) btnMenu.focus();
  }
  btnMenu.addEventListener("click", function () { setMenu(true); });
  menu.querySelector("[data-fechar-menu]").addEventListener("click", function () { setMenu(false); });
  menu.addEventListener("click", function (e) { if (e.target.closest("ul a") && menuAberto()) setMenu(false, true); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuAberto()) setMenu(false);
    // Prende o foco no menu em tela cheia
    if (e.key === "Tab" && menuAberto()) {
      var f = $$("a,button", menu).filter(function (n) { return n.offsetParent; });
      var p = f[0], u = f[f.length - 1];
      if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); }
      else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); }
    }
  });
  window.matchMedia("(min-width:1100px)").addEventListener("change", function (m) {
    if (m.matches && menuAberto()) setMenu(false, true);
  });

  // Seção atual no menu
  var links = $$(".menu ul a");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + e.target.id); if (a.hasAttribute("aria-current")) a.setAttribute("aria-current", "true"); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute("href")); if (s) io.observe(s); });
  }

  // Barra fixa do mobile: reserva espaço no fim da página
  var barra = document.getElementById("barra");
  function reserva() { document.documentElement.style.setProperty("--reserva", getComputedStyle(barra).position === "fixed" ? barra.offsetHeight + "px" : "0px"); }
  reserva(); window.addEventListener("resize", reserva);

  // Zoom da galeria
  var itens = $$("[data-zoom]");
  if (!itens.length || !window.HTMLDialogElement) return;
  var dlg = document.createElement("dialog");
  dlg.className = "zoom"; dlg.setAttribute("aria-labelledby", "zoom-tit");
  dlg.innerHTML = '<div class="zoom-in"><div class="zoom-cab"><p id="zoom-tit"></p><button type="button" class="btn" data-x aria-label="Fechar imagem ampliada">Fechar</button></div>' +
    '<div class="zoom-corpo"><img alt=""></div><p class="zoom-leg"><span class="selo selo--dev">Em desenvolvimento · Prévia</span> <span data-leg></span></p>' +
    '<div class="zoom-ctl"><button type="button" class="btn" data-ant>Anterior</button><span class="zoom-pos" aria-live="polite"></span><button type="button" class="btn" data-prox>Próxima</button></div></div>';
  document.body.appendChild(dlg);
  var im = dlg.querySelector("img"), corpo = dlg.querySelector(".zoom-corpo"), atual = 0, origem = null;
  function mostrar(i) {
    atual = (i + itens.length) % itens.length;
    var a = itens[atual];
    corpo.querySelector(".zoom-erro") && corpo.querySelector(".zoom-erro").remove();
    im.hidden = false; im.src = a.href; im.alt = a.dataset.alt;
    im.onerror = function () { im.hidden = true; var p = document.createElement("p"); p.className = "zoom-erro"; p.textContent = "Não foi possível carregar esta imagem."; corpo.appendChild(p); };
    dlg.querySelector("#zoom-tit").textContent = "Imagem " + (atual + 1) + " de " + itens.length;
    dlg.querySelector("[data-leg]").textContent = a.dataset.leg;
    dlg.querySelector(".zoom-pos").textContent = (atual + 1) + " de " + itens.length;
  }
  itens.forEach(function (a, i) {
    a.addEventListener("click", function (e) { e.preventDefault(); origem = a; mostrar(i); dlg.showModal(); document.body.style.overflow = "hidden"; });
  });
  dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.closest("[data-x]")) dlg.close(); });
  dlg.querySelector("[data-ant]").addEventListener("click", function () { mostrar(atual - 1); });
  dlg.querySelector("[data-prox]").addEventListener("click", function () { mostrar(atual + 1); });
  dlg.addEventListener("keydown", function (e) { if (e.key === "ArrowLeft") mostrar(atual - 1); if (e.key === "ArrowRight") mostrar(atual + 1); });
  dlg.addEventListener("close", function () { document.body.style.overflow = ""; if (origem) origem.focus(); });
})();
