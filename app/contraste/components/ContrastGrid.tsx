"use client";

import React from "react";

/* ===== Utils mínimos ===== */
type RGB = { r:number; g:number; b:number };
const hexToRgb = (hex:string):RGB => {
  const s = hex.replace("#","");
  const f = s.length === 3 ? s.split("").map(c=>c+c).join("") : s;
  const n = parseInt(f, 16);
  return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
};
const relLum = ({r,g,b}:RGB) => {
  const f=(v:number)=>{ const c=v/255; return c<=0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4); };
  const R=f(r), G=f(g), B=f(b);
  return 0.2126*R + 0.7152*G + 0.0722*B;
};
const ratio = (a:string,b:string) => {
  const L1=relLum(hexToRgb(a)), L2=relLum(hexToRgb(b));
  const hi=Math.max(L1,L2), lo=Math.min(L1,L2);
  return (hi+0.05)/(lo+0.05);
};
const badgeByRatio = (r:number) =>
  r>=7   ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
: r>=4.5 ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30"
         : "bg-rose-500/20 text-rose-300 ring-1 ring-rose-400/30";

/* ===== Tipado y datos ===== */
export type ContrastItem = {
  /** Texto (ej. “Az”) grande dentro de la tarjeta */
  label: string;
  /** Color del texto (HEX) */
  fg: string;
  /** Color de fondo (HEX) */
  bg: string;
};

/**
 * EDITA ESTE ARRAY para agregar o quitar tarjetas.
 * Solo agrega objetos { label, fg, bg } como los siguientes.
 */
export const CONTRAST_SETS: ContrastItem[] = [
  { label: "Az", fg: "#0AEF48", bg: "#0531CB" },
  { label: "Az", fg: "#964D1E", bg: "#0AFE57" },
  { label: "Az", fg: "#7C28D0", bg: "#A9D4C2" },
  { label: "Az", fg: "#1E4527", bg: "#81C5F9" },
  { label: "Az", fg: "#BFE756", bg: "#2B675D" },
  { label: "Az", fg: "#A2BFD5", bg: "#9D0815" },
  { label: "Az", fg: "#0E42F7", bg: "#8EFDB7" },
  { label: "Az", fg: "#A8D9C8", bg: "#3A1CDB" },
];

/* ===== Componente ===== */
export default function ContrastGrid({
  items = CONTRAST_SETS,
  title = "Colores de contraste",
}: {
  items?: ContrastItem[];
  title?: string;
}) {
  return (
    <section className="w-full">
      <h2 className="mb-4 text-xl sm:text-2xl font-semibold">{title}</h2>

      {/* Grid responsivo tipo “tarjetas grandes” */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((it, idx) => {
          const r = ratio(it.fg, it.bg);
          return (
            <article key={`${it.fg}-${it.bg}-${idx}`} className="overflow-hidden rounded-[22px] ring-1 ring-white/10">
              {/* Tile grande con texto y ratio (como en tu captura) */}
              <div className="relative m-[6px] h-[260px] rounded-[22px] sm:h-[300px]" style={{ background: it.bg }}>
                <div className="relative z-10 flex h-full flex-col items-center justify-center">
                  <div className="text-[64px] sm:text-[72px] font-extrabold tracking-tight" style={{ color: it.fg }}>
                    {it.label}
                  </div>
                  <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1 ${badgeByRatio(r)}`}>
                    <span>◉</span>
                    <span className="font-mono">{r.toFixed(2)}:1</span>
                  </div>
                </div>
              </div>

              {/* Swatches y códigos HEX debajo */}
              <div className="px-4 pb-4 pt-2">
                <div className="mb-2 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full ring-1 ring-white/20" style={{ background: it.fg }} />
                    <span className="font-mono text-xs sm:text-sm text-white/90">{it.fg}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full ring-1 ring-white/20" style={{ background: it.bg }} />
                    <span className="font-mono text-xs sm:text-sm text-white/90">{it.bg}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
