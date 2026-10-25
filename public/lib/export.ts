import { PAPER_H, PAPER_W } from "./certificate/Certificate";

const SCALE = 3;

async function render(node: HTMLElement): Promise<string> {
  const { toPng } = await import("html-to-image");
  await document.fonts?.ready;
  const opts = { pixelRatio: SCALE, width: PAPER_W, height: PAPER_H, cacheBust: false };
  // The first pass warms up image loading; the second is the one we keep.
  await toPng(node, opts);
  return toPng(node, opts);
}

function save(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
}

export function safeFilename(base: string) {
  return base.replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "certificate";
}

export async function downloadPng(node: HTMLElement, filename: string) {
  save(await render(node), `${filename}.png`);
}

export async function downloadPdf(node: HTMLElement, filename: string) {
  const [png, { jsPDF }] = await Promise.all([render(node), import("jspdf")]);
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  pdf.addImage(png, "PNG", 0, 0, 297, 210, undefined, "FAST");
  const url = URL.createObjectURL(pdf.output("blob"));
  save(url, `${filename}.pdf`);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
