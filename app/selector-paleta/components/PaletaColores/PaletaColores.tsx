"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";

/* Tipado de coloesr*/
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

/*Contraste y selección de color de texto*/
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

/*Generación de familia (shades)*/
/* Genera 'steps' tonos alrededor del seed: mantiene H y S, varía L.*/
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

type ColorBoardProps = {
  seeds?: string[];      // lista de colores (HEX) por seeds para la tabla
  columns?: number;      // grid de los colores
  dotSize?: number;      // tamaño de los colores en la tabla
  familySteps?: number;  // Tonos a mostrar por familia
  title?: string;
};

export default function PaletaColores({
  //Semillas base de colores para el grid
  seeds = [
    "#E35342","#FFB11E","#FF4966","#9E2997",
    "#9C93E5","#C7A3D2","#BA8CBE","#7F4EA8",
    "#F5EDF0","#DCBDDF","#9A99E1","#008BD0",
    "#201C57","#201C6D","#1E1A84","#2D198E","#411A8D",
    "#E0AA00","#FFA61D",
    "#0084C7","#00BCD4","#03A9F4","#2196F3",
    "#4CAF50","#8BC34A","#CDDC39",
    "#795548","#607D8B","#9E9E9E",
    "#000000","#FFFFFF",
  ],
  columns = 10,
  dotSize = 40,
  familySteps = 5,
  title = "Paleta",
}: ColorBoardProps) {
  const [openFor, setOpenFor] = useState<string | null>(null);
  const family = useMemo(
    () => (openFor ? generateFamily(openFor, familySteps) : []),
    [openFor, familySteps]
  );

  // cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenFor(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="w-full">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Haz clic en cualquier color para ver su familia (HEX y RGB).
        </p>
      </div>

      {/* Grid */}
      <div className="rounded-2xl bg-neutral-900 p-5 ring-1 ring-white/10" style={{ overflow: "hidden" }}>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {seeds.map((hex) => (
            <button
              key={hex}
              title={hex}
              aria-label={hex}
              onClick={() => setOpenFor(hex)}
              className="rounded-full ring-1 ring-white/10 hover:ring-white/40 transition"
              style={{ backgroundColor: hex, aspectRatio: "1 / 1", width: dotSize }}
            />
          ))}
        </div>
      </div>

      {/* Cuadro de dialogo por familia de color*/}
      {openFor && (
        <Dialog onClose={() => setOpenFor(null)}>
          <FamilyCard seed={openFor} family={family} onClose={() => setOpenFor(null)} />
        </Dialog>
      )}
    </section>
  );
}

/*Diálogo de forma nativa*/
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
      className="backdrop:bg-black/60 p-0 rounded-2xl overflow-hidden"
      onClick={(e) => {
        const dialog = e.currentTarget as HTMLDialogElement;
        const rect = dialog.getBoundingClientRect();
        const outside =
          e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
        if (outside) onClose();
      }}
    >
      {children}
    </dialog>
  );
}

/*Tarjeta de familia con contraste para mejor visualización*/
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
    <div className="w-[320px] sm:w-[380px] bg-neutral-950 text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-full ring-1 ring-white/20" style={{ background: seed }} />
          <div className="text-sm">
            <div className="font-medium">Familia</div>
            <div className="text-white/60">{seed} · {toRgbString(seed)}</div>
          </div>
        </div>
        <button onClick={onClose} className="rounded-md px-2 py-1 text-sm text-white/80 hover:bg-white/10">✕</button>
      </div>

      <div className="px-4 pb-4">
        <div className="overflow-hidden rounded-xl ring-1 ring-white/10">
          {family.map(({ hex, rgb }, i) => {
            const textHex = bestTextColor(hex);
            const ratio = contrastRatio(hex, textHex);
            const needsBackplate = ratio < 4.5; // WCAG AA para texto normal

            const textBase = textHex === "#000000" ? "text-black/90" : "text-white";
            const subText = textHex === "#000000" ? "text-black/70" : "text-white/85";
            const btnBase =
              textHex === "#000000"
                ? "bg-black/10 hover:bg-black/20 text-black"
                : "bg-white/15 hover:bg-white/25 text-white";
            const plate = textHex === "#000000" ? "bg-white/70" : "bg-black/35";

            return (
              <div key={hex + i} className="flex items-center justify-between px-3 py-4" style={{ background: hex }}>
                <div
                  className={`font-mono text-sm ${textBase}`}
                  style={{ textShadow: textHex === "#000000" ? "none" : "0 1px 1px rgba(0,0,0,.35)" }}
                >
                  <div className={needsBackplate ? `inline-block rounded px-1.5 py-0.5 ${plate}` : ""}>
                    {hex}
                  </div>
                  <div
                    className={`${needsBackplate ? `inline-block rounded px-1.5 py-0.5 ${plate} ml-1` : ""} ${subText}`}
                  >
                    {rgb}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => doCopy(hex)} className={`rounded-lg px-2 py-1 text-xs ring-1 ring-black/5 ${btnBase}`}>
                    Copiar HEX
                  </button>
                  <button onClick={() => doCopy(rgb)} className={`rounded-lg px-2 py-1 text-xs ring-1 ring-black/5 ${btnBase}`}>
                    Copiar RGB
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-xs text-white/60">
          Cierra la ventana presionando la tecla <code>ESC</code>.
        </p>
      </div>

      {/* mini toast */}
      <div className={["pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center transition",
        toast ? "opacity-100" : "opacity-0"].join(" ")}>
        <div className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-900 shadow-lg ring-1 ring-black/10">
          Copiado: <span className="font-mono">{toast}</span>
        </div>
      </div>
    </div>
  );
}
