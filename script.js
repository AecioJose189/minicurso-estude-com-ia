// Lê e grava preferências sem quebrar a página se o navegador bloquear o armazenamento
function lerPreferencia(chave) {
  try { return localStorage.getItem(chave); } catch (e) { return null; }
}
function salvarPreferencia(chave, valor) {
  try { localStorage.setItem(chave, valor); } catch (e) { /* ignora */ }
}

var raiz = document.documentElement;

// ===== Tamanho do texto (A− / A / A+) =====
var TAMANHOS = [100, 112.5, 125, 137.5, 150];
var nivelFonte = parseInt(lerPreferencia("nivelFonte"), 10) || 0;

function aplicarFonte() {
  raiz.style.fontSize = TAMANHOS[nivelFonte] + "%";
  salvarPreferencia("nivelFonte", nivelFonte);
}

document.querySelectorAll("[data-fonte]").forEach(function (botao) {
  botao.addEventListener("click", function () {
    var passo = parseInt(botao.dataset.fonte, 10);
    nivelFonte = passo === 0 ? 0 : Math.min(Math.max(nivelFonte + passo, 0), TAMANHOS.length - 1);
    aplicarFonte();
  });
});
aplicarFonte();

// ===== Alto contraste =====
var botaoContraste = document.getElementById("btn-contraste");

function aplicarContraste(ativo) {
  if (ativo) raiz.setAttribute("data-contraste", "alto");
  else raiz.removeAttribute("data-contraste");
  botaoContraste.setAttribute("aria-pressed", ativo ? "true" : "false");
  salvarPreferencia("altoContraste", ativo ? "1" : "0");
}

botaoContraste.addEventListener("click", function () {
  aplicarContraste(botaoContraste.getAttribute("aria-pressed") !== "true");
});
aplicarContraste(lerPreferencia("altoContraste") === "1");

// ===== Menu em telas pequenas =====
var botaoMenu = document.querySelector(".menu-toggle");
var menu = document.getElementById("menu");

function fecharMenu() {
  menu.classList.remove("aberto");
  botaoMenu.setAttribute("aria-expanded", "false");
}

botaoMenu.addEventListener("click", function () {
  var aberto = menu.classList.toggle("aberto");
  botaoMenu.setAttribute("aria-expanded", aberto ? "true" : "false");
});

menu.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", fecharMenu);
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && menu.classList.contains("aberto")) {
    fecharMenu();
    botaoMenu.focus();
  }
});

// ===== Destaca no menu a seção que está na tela =====
var linksMenu = menu.querySelectorAll("a");

if ("IntersectionObserver" in window) {
  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;
      linksMenu.forEach(function (link) {
        if (link.getAttribute("href") === "#" + entrada.target.id) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-35% 0px -60% 0px" });

  document.querySelectorAll("main section[id]").forEach(function (secao) {
    observador.observe(secao);
  });
}

// Ao seguir um link interno, move o foco para a seção (ajuda leitores de tela e teclado)
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener("click", function () {
    var alvo = document.querySelector(link.getAttribute("href"));
    if (!alvo) return;
    var titulo = alvo.querySelector("h1, h2") || alvo;
    if (!titulo.hasAttribute("tabindex")) titulo.setAttribute("tabindex", "-1");
    setTimeout(function () { titulo.focus({ preventScroll: true }); }, 400);
  });
});

// ===== Capítulos: pula o vídeo para o trecho escolhido =====
var player = document.getElementById("player");
var botoesCapitulo = document.querySelectorAll("[data-inicio]");

botoesCapitulo.forEach(function (botao) {
  botao.addEventListener("click", function () {
    var url = new URL(player.src);
    url.searchParams.set("start", botao.dataset.inicio);
    url.searchParams.set("autoplay", "1");
    player.src = url.toString();

    botoesCapitulo.forEach(function (b) { b.removeAttribute("aria-current"); });
    botao.setAttribute("aria-current", "true");
    player.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

// ===== Botão "Copiar prompt" =====
document.querySelectorAll(".botao-copiar").forEach(function (botao) {
  botao.addEventListener("click", function () {
    var texto = document.getElementById(botao.dataset.alvo).innerText;
    var aviso = botao.nextElementSibling;

    navigator.clipboard.writeText(texto).then(
      function () { aviso.textContent = "Copiado! Agora é só colar no assistente."; },
      function () { aviso.textContent = "Não foi possível copiar. Selecione o texto manualmente."; }
    );

    setTimeout(function () { aviso.textContent = ""; }, 4000);
  });
});
