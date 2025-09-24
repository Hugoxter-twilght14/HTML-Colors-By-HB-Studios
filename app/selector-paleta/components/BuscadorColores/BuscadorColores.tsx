"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useMemo, useRef, useState } from "react";

/*Utilidades de color independientes*/
type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}
function hexToRgb(hex: string): RGB {
  const s = hex.replace("#", "");
  const full = s.length === 3 ? s.split("").map(c => c + c).join("") : s;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex({ r, g, b }: RGB) {
  const to = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}
function rgbToHsl({ r, g, b }: RGB): HSL {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case R: h = (G - B) / d + (G < B ? 6 : 0); break;
      case G: h = (B - R) / d + 2; break;
      default: h = (R - G) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToRgb({ h, s, l }: HSL): RGB {
  const H = h / 360, S = s / 100, L = l / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (S === 0) {
    const v = Math.round(L * 255);
    return { r: v, g: v, b: v };
  }
  const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
  const p = 2 * L - q;
  const r = hue2rgb(p, q, H + 1 / 3);
  const g = hue2rgb(p, q, H);
  const b = hue2rgb(p, q, H - 1 / 3);
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
function toRgbString(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
}
function copy(text: string) {
  return navigator.clipboard.writeText(text).catch(() => {});
}

/* Contraste y helpers */
function relativeLuminance({ r, g, b }: RGB) {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const R = f(r), G = f(g), B = f(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrastRatio(hex1: string, hex2: string) {
  const L1 = relativeLuminance(hexToRgb(hex1));
  const L2 = relativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(L1, L2), darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}
function bestTextColor(hexBg: string): "#000000" | "#FFFFFF" {
  const cB = contrastRatio(hexBg, "#000000");
  const cW = contrastRatio(hexBg, "#FFFFFF");
  return cB >= cW ? "#000000" : "#FFFFFF";
}

/* Generación de familia */
function generateFamily(seedHex: string, steps = 5): { hex: string; rgb: string }[] {
  const base = rgbToHsl(hexToRgb(seedHex));
  const preset = [-28, -14, 0, +14, +28];
  const deltas =
    steps === 5
      ? preset
      : Array.from({ length: steps }, (_, i) => -30 + (60 * i) / Math.max(steps - 1, 1));
  return deltas.map((delta) => {
    const l = clamp(base.l + delta, 8, 92);
    const sAdjust = Math.max(28, base.s - Math.abs(delta) * 0.2);
    const rgb = hslToRgb({ h: base.h, s: sAdjust, l });
    const hex = rgbToHex(rgb);
    return { hex, rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` };
  });
}

/*Barra de busqueda (RESPONSIVA)*/
export default function BuscadorColor({
  familySteps = 5,
  dotSize = 44,
}: {
  familySteps?: number;
  dotSize?: number;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [openFor, setOpenFor] = useState<string | null>(null);

  const family = useMemo(
    () => (openFor ? generateFamily(openFor, familySteps) : []),
    [openFor, familySteps]
  );

  function parseTokens(input: string): string[] {
    const tokens = input
      .split(/[\s,;]+/)
      .map((t) => t.trim())
      .filter(Boolean);

    const hexes: string[] = [];
    const rgbRe = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i;
    const hexRe = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

    for (const t of tokens) {
      if (hexRe.test(t)) {
        const s = t.toUpperCase();
        if (s.length === 4) {
          const full = `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
          hexes.push(full);
        } else hexes.push(s);
        continue;
      }
      const m = t.match(rgbRe);
      if (m) {
        const r = Math.min(255, parseInt(m[1], 10));
        const g = Math.min(255, parseInt(m[2], 10));
        const b = Math.min(255, parseInt(m[3], 10));
        hexes.push(rgbToHex({ r, g, b }));
      }
    }
    return Array.from(new Set(hexes));
  }

  function doSearch() {
    setResults(parseTokens(query));
  }

  return (
    <section className="w-full">
      {/* Barra de control responsiva */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
          placeholder="Escribe HEX (#FF5733) o RGB (rgb(255, 87, 51)). Puedes ingresar varios separados por coma o espacio."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm sm:text-base text-white placeholder-white/60"
        />
        <div className="flex gap-2 sm:ml-2">
          <Button
            onClick={doSearch}
            className="flex-1 sm:flex-none rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm sm:text-base text-white hover:bg-white/20"
          >
            Buscar
          </Button>
          <Button
            onClick={() => { setQuery(""); setResults([]); }}
            className="flex-1 sm:flex-none rounded-lg border border-white/10 bg-white/0 px-3 py-2 text-sm sm:text-base text-white/80 hover:bg-white/10"
          >
            Limpiar
          </Button>
        </div>
      </div>

      {/*Resultados de la búsqueda (RESPONSIVO)*/}
      <div className="rounded-2xl bg-neutral-900 p-4 sm:p-5 ring-1 ring-white/10">
        <div className="mb-3 text-sm sm:text-base text-white/70">
          {results.length > 0
            ? `Resultados: ${results.length}`
            : "Ingresa uno o más colores y presiona Buscar."}
        </div>

        {results.length > 0 && (
          <div
            className="grid gap-3 sm:gap-4"
            style={{
              // círculos fluidos 36–56px; se acomodan tantas columnas como quepan
              gridTemplateColumns: `repeat(auto-fit, minmax(clamp(36px, 7vw, 56px), 1fr))`,
            }}
          >
            {results.map((hex) => (
              <Button
                key={hex}
                title={hex}
                aria-label={hex}
                onClick={() => setOpenFor(hex)}
                className="mx-auto w-full rounded-full ring-1 ring-white/10 hover:ring-white/40 transition"
                style={{
                  backgroundColor: hex,
                  aspectRatio: "1 / 1",
                  minWidth: Math.min(36, dotSize) + "px",
                  maxWidth: `clamp(${Math.min(36, dotSize)}px, 7vw, ${Math.max(56, dotSize)}px)`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {openFor && (
        <Dialog onClose={() => setOpenFor(null)}>
          <FamilyCard seed={openFor} family={family} onClose={() => setOpenFor(null)} />
        </Dialog>
      )}
    </section>
  );
}

/*Cuadro de diálogo y tarjeta de colores — RESPONSIVOS */
function Dialog({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current!;
    if (!d.open) d.showModal();
    const handleCancel = (e: Event) => { e.preventDefault(); onClose(); };
    d.addEventListener("cancel", handleCancel);
    return () => d.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      className="backdrop:bg-black/60 p-0 rounded-2xl sm:rounded-2xl overflow-hidden
                 w-[92vw] max-w-[380px] sm:w-auto sm:max-w-none
                 max-h-[88vh]"
      onClick={(e) => {
        const dialog = e.currentTarget as HTMLDialogElement;
        const rect = dialog.getBoundingClientRect();
        const outside =
          e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
        if (outside) onClose();
      }}
    >
      <div className="overflow-auto">{children}</div>
    </dialog>
  );
}

function FamilyCard({
  seed,
  family,
  onClose,
}: {
  seed: string;
  family: { hex: string; rgb: string }[];
  onClose: () => void;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const doCopy = async (text: string) => {
    await copy(text);
    setToast(text);
    setTimeout(() => setToast(null), 900);
  };

  return (
    <div className="bg-neutral-950 text-white w-full">
      <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-full ring-1 ring-white/20" style={{ background: seed }} />
          <div className="text-sm sm:text-base">
            <div className="font-medium">Familia</div>
            <div className="text-white/60 text-xs sm:text-sm">{seed} · {toRgbString(seed)}</div>
          </div>
        </div>
        <Button onClick={onClose} className="rounded-md px-3 py-1.5 text-sm text-white/80 hover:bg-white/10">
          ✕
        </Button>
      </div>

      <div className="px-3 sm:px-4 pb-4 sm:pb-5">
        <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
          {family.map(({ hex, rgb }, i) => {
            const textHex = bestTextColor(hex);
            const ratio = contrastRatio(hex, textHex);
            const needsBackplate = ratio < 4.5;

            const textBase = textHex === "#000000" ? "text-black/90" : "text-white";
            const subText = textHex === "#000000" ? "text-black/70" : "text-white/85";
            const btnBase =
              textHex === "#000000"
                ? "bg-black/10 hover:bg-black/20 text-black"
                : "bg-white/15 hover:bg-white/25 text-white";
            const plate = textHex === "#000000" ? "bg-white/75" : "bg-black/35";

            return (
              <div key={hex + i} className="flex items-center justify-between px-3 py-3 sm:py-4" style={{ background: hex }}>
                <div
                  className={`font-mono text-[12px] sm:text-sm ${textBase}`}
                  style={{ textShadow: textHex === "#000000" ? "none" : "0 1px 1px rgba(0,0,0,.35)" }}
                >
                  <div className={needsBackplate ? `inline-block rounded px-1.5 py-0.5 ${plate}` : ""}>
                    {hex}
                  </div>
                  <div className={`${needsBackplate ? `inline-block rounded px-1.5 py-0.5 ${plate} ml-1` : ""} ${subText}`}>
                    {rgb}
                  </div>
                </div>

                <div className="flex gap-1.5 sm:gap-2">
                  <Button onClick={() => doCopy(hex)} className={`rounded-lg px-2 py-1 text-xs sm:text-[13px] ring-1 ring-black/5 ${btnBase}`}>
                    Copiar HEX
                  </Button>
                  <Button onClick={() => doCopy(rgb)} className={`rounded-lg px-2 py-1 text-xs sm:text-[13px] ring-1 ring-black/5 ${btnBase}`}>
                    Copiar RGB
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-xs sm:text-[13px] text-white/60">
          Cierra esta ventana presionando <code>ESC</code>.
        </p>
      </div>

      {/* toast */}
      <div className={`pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center transition ${toast ? "opacity-100" : "opacity-0"}`}>
        <div className="rounded-full bg-white/90 px-3 py-1 text-[12px] sm:text-xs font-medium text-neutral-900 shadow-lg ring-1 ring-black/10">
          Copiado: <span className="font-mono">{toast}</span>
        </div>
      </div>
    </div>
  );
}
