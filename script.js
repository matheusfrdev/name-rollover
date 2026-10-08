"use strict";

// Personalize a animacao aqui.
const CONFIGURACAO = {
  nomes: ["luiz.dev", "anaclara", "pedrozin", "julia.santos", "caique", "biah.exe",
    "rafa.codes", "gabi.lima", "joaovitor", "leticia", "brunow", "mariana.js"],
  nomeFinal: "matheusfrdev",
  prefixo: "github.com/",
  linhas: 7,
  ciclos: 3,
  duracaoGiro: 4.5,
  corDestaque: "#494cff;",
  repetir: false,
  pausaRepeticao: 2000
};

const janela = document.getElementById("janela");
const lista = document.getElementById("lista");
const seletor = document.querySelector(".seletor-usuario");
const movimentoReduzido = matchMedia("(prefers-reduced-motion: reduce)");
const linhas = Math.max(3, Math.floor(CONFIGURACAO.linhas) | 1);
const metade = Math.floor(linhas / 2);
const nomes = CONFIGURACAO.nomes.length ? CONFIGURACAO.nomes : [CONFIGURACAO.nomeFinal];
let animacao, temporizadorDestaque, temporizadorRepeticao, geracao = 0;
let indiceFinal = metade;
let alturaLinha = 0;


function embaralhar(entrada) {
  const resultado = [...entrada];
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }
  return resultado;
}
function deslocamento(indice) {
  return alturaLinha * (linhas / 2 - indice - .5);
}
function transformar(indice) { return `translateY(${deslocamento(indice)}px)`; }
function definirFase(valor) {
  janela.classList.toggle("destacada", valor === "destacada");
  janela.classList.toggle("concluida", valor === "concluida");
}
function medir() {
  // Limpa a largura anterior antes de medir o tamanho natural dos nomes.
  janela.style.width = "";
  alturaLinha = lista.firstElementChild.getBoundingClientRect().height;
  janela.style.setProperty("--altura-linha", `${alturaLinha}px`);
  janela.style.height = `${alturaLinha * linhas}px`;
  const largura = Math.max(...Array.from(lista.children,
    elemento => elemento.getBoundingClientRect().width));
  janela.style.width = `${Math.ceil(largura)}px`;
}
function parar() {
  geracao++;
  animacao?.cancel();
  clearTimeout(temporizadorDestaque);
  clearTimeout(temporizadorRepeticao);
}
function executar() {
  parar();
  const atual = geracao;
  const preenchimento = Array.from({ length: metade }, (_, i) => embaralhar(nomes)[i % nomes.length]);
  const itens = [...preenchimento, CONFIGURACAO.nomeFinal];
  for (let ciclo = 0; ciclo < Math.max(1, CONFIGURACAO.ciclos); ciclo++) itens.push(...embaralhar(nomes));
  // Garante linhas suficientes mesmo com poucos nomes.
  while (itens.length < linhas + 1) itens.push(...nomes);
  lista.replaceChildren(...itens.map((nome, indice) => {
    const elemento = document.createElement("div");
    elemento.className = "linha" + (indice === indiceFinal ? " linha--final" : "");
    elemento.textContent = nome;
    return elemento;
  }));
  seletor.style.fontSize = "";
  medir();
  ajustar();
  medir();
  janela.classList.add("pronta");
  definirFase("girando");
  lista.style.transform = transformar(indiceFinal);
  if (movimentoReduzido.matches || !lista.animate) { definirFase("concluida"); return; }
  const inicio = Math.max(indiceFinal + 1, itens.length - 1 - metade);
  animacao = lista.animate([
    { transform: transformar(inicio) },
    { transform: transformar(indiceFinal) }
  ], {
    duration: Math.max(0, CONFIGURACAO.duracaoGiro) * 1000,
    easing: "cubic-bezier(.65, 0, .35, 1)",
    fill: "forwards"
  });
  animacao.onfinish = () => {
    if (atual !== geracao) return;
    animacao.cancel();
    definirFase("destacada");
    temporizadorDestaque = setTimeout(() => {
      definirFase("concluida");
      if (CONFIGURACAO.repetir) temporizadorRepeticao = setTimeout(executar, Math.max(0, CONFIGURACAO.pausaRepeticao));
    }, 850);
  };
}

document.getElementById("prefixo").textContent = CONFIGURACAO.prefixo;
document.getElementById("nome-acessivel").textContent = CONFIGURACAO.prefixo + CONFIGURACAO.nomeFinal;
janela.style.setProperty("--destaque", CONFIGURACAO.corDestaque);

// Ajusta nomes longos em telas estreitas sem transbordar.
function ajustar() {
  seletor.style.fontSize = "";
  const disponivel = document.querySelector(".tela").clientWidth - 48;
  const tamanho = parseFloat(getComputedStyle(seletor).fontSize);
  const larguraTotal = document.getElementById("prefixo").getBoundingClientRect().width
    + parseFloat(janela.style.width);
  if (larguraTotal > disponivel) {
    seletor.style.fontSize = `${tamanho * disponivel / larguraTotal}px`;
  }
}
function inicializar() { executar(); }
inicializar();
let temporizadorTamanho;
window.addEventListener("resize", () => {
  clearTimeout(temporizadorTamanho);
  temporizadorTamanho = setTimeout(inicializar, 120);
});
movimentoReduzido.addEventListener("change", executar);
