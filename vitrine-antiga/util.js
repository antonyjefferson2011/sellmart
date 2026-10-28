// Funções compartilhadas por index.html e painel.html.
// Todo conteúdo vindo do banco entra na página via textContent (nunca innerHTML).

export const h = (tag, props = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "class") e.className = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  e.append(...kids);
  return e;
};

export const brl = (n) =>
  Number(n) > 0
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n)
    : "Grátis";

// Aceita apenas http(s); devolve "" para qualquer outra coisa (javascript:, data:, etc.)
export const safeUrl = (u) => {
  try {
    const x = new URL(String(u).trim());
    return x.protocol === "https:" || x.protocol === "http:" ? x.href : "";
  } catch {
    return "";
  }
};

export const norm = (s) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function productCard(p, i = 0) {
  const cover = h("div", { class: "cover" });
  const img = safeUrl(p.imagem);
  if (img) {
    const im = h("img", { src: img, alt: "", loading: "lazy", referrerpolicy: "no-referrer" });
    im.onerror = () => im.remove(); // imagem indisponível: fica o fundo da capa
    cover.append(im);
  }
  const link = safeUrl(p.urlCompra);
  const buy = link
    ? h("a", { class: "btn", href: link, target: "_blank", rel: "noopener noreferrer" }, "Comprar")
    : h("span", { class: "btn", style: "opacity:.5" }, "Comprar");
  return h(
    "article",
    { class: "card pcard", style: `animation-delay:${Math.min(i, 12) * 40}ms` },
    cover,
    h(
      "div",
      { class: "pbody" },
      h("span", { class: "tag" }, p.categoria || "Sem categoria"),
      h("h3", {}, p.nome || "Sem nome"),
      h("p", {}, p.descricao || ""),
      h("div", { class: "pfoot" }, h("span", { class: "price" }, brl(p.preco)), buy)
    )
  );
}
