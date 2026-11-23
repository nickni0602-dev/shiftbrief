import clipboardList from "../vendor/lucide/clipboard-list.js";
import copy from "../vendor/lucide/copy.js";
import fileText from "../vendor/lucide/file-text.js";
import shieldCheck from "../vendor/lucide/shield-check.js";
import sparkles from "../vendor/lucide/sparkles.js";

const icons = { "clipboard-list": clipboardList, copy, "file-text": fileText, "shield-check": shieldCheck, sparkles };
const namespace = "http://www.w3.org/2000/svg";

export function drawIcons() {
  for (const placeholder of document.querySelectorAll("i[data-lucide]")) {
    const svg = document.createElementNS(namespace, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    for (const [tag, attributes] of icons[placeholder.dataset.lucide]) {
      const element = document.createElementNS(namespace, tag);
      for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
      svg.append(element);
    }
    placeholder.replaceWith(svg);
  }
}
