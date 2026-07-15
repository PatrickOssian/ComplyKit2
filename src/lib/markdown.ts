// In-system document editor: converts between the stored rich-text HTML
// body and a lightweight editable text format (## heading, - bullet,
// 1. numbered, **bold**). Ported from ComplyKit.dc.html's
// htmlToText()/textToHtml(). htmlToText() needs a DOM, so this module is
// client-only (import it from "use client" components only).

function inline(node: ChildNode): string {
  let s = "";
  node.childNodes.forEach((c) => {
    if (c.nodeType === Node.TEXT_NODE) {
      s += c.textContent ?? "";
    } else if (c.nodeType === Node.ELEMENT_NODE) {
      const el = c as HTMLElement;
      if (el.tagName === "STRONG" || el.tagName === "B") {
        s += `**${inline(el)}**`;
      } else {
        s += inline(el);
      }
    }
  });
  return s;
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

export function htmlToText(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  const out: string[] = [];
  div.childNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      const t = clean(node.textContent || "");
      if (t) out.push(t);
      return;
    }
    const el = node as HTMLElement;
    const tag = el.tagName;
    if (/^H[1-4]$/.test(tag)) {
      out.push(`## ${clean(inline(el))}`);
      out.push("");
    } else if (tag === "P") {
      out.push(clean(inline(el)));
      out.push("");
    } else if (tag === "UL") {
      Array.from(el.children).forEach((li) => out.push(`- ${clean(inline(li))}`));
      out.push("");
    } else if (tag === "OL") {
      let i = 1;
      Array.from(el.children).forEach((li) => {
        out.push(`${i++}. ${clean(inline(li))}`);
      });
      out.push("");
    } else {
      const t = clean(inline(el));
      if (t) {
        out.push(t);
        out.push("");
      }
    }
  });
  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const HEADING_STYLE =
  "font-size:13.5px;font-weight:700;color:#101828;margin:20px 0 7px;letter-spacing:-.1px";
const FIRST_HEADING_STYLE =
  "font-size:13.5px;font-weight:700;color:#101828;margin:2px 0 7px;letter-spacing:-.1px";

export function textToHtml(text: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const inl = (s: string) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  const lines = (text || "").split("\n");
  let html = "";
  let i = 0;
  let first = true;

  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*$/.test(line)) {
      i++;
      continue;
    }
    if (/^##\s+/.test(line)) {
      html += `<h3 style="${first ? FIRST_HEADING_STYLE : HEADING_STYLE}">${inl(line.replace(/^##\s+/, ""))}</h3>`;
      first = false;
      i++;
      continue;
    }
    if (/^\s*[-•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-•]\s+/.test(lines[i])) {
        items.push(`<li style="margin:0 0 5px">${inl(lines[i].replace(/^\s*[-•]\s+/, ""))}</li>`);
        i++;
      }
      html += `<ul style="margin:0 0 9px;padding-left:20px">${items.join("")}</ul>`;
      first = false;
      continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(`<li style="margin:0 0 6px">${inl(lines[i].replace(/^\s*\d+\.\s+/, ""))}</li>`);
        i++;
      }
      html += `<ol style="margin:0 0 9px;padding-left:20px">${items.join("")}</ol>`;
      first = false;
      continue;
    }
    const para = [line];
    i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^##\s+/.test(lines[i]) && !/^\s*[-•]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    html += `<p style="margin:0 0 9px">${inl(para.join(" "))}</p>`;
    first = false;
  }
  return html;
}
