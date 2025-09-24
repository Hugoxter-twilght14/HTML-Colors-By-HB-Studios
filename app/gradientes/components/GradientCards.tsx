"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

/* --------- Tipos --------- */
export type GradStop = string; 
export type GradientItem = { angle: number; stops: GradStop[] };

/* --------- Presets (edítalos/agrega) --------- */
export const GRADIENTS: GradientItem[] = [
  { angle: 90, stops: ["#F44336 0%", "#FFC107 100%"] },
  { angle: 90, stops: ["#6A38C2 0%", "#6A38C2 50%", "#6A38C2 100%"] },
  { angle: 90, stops: ["#E8ED92 0%", "#A8E6CF 100%"] },
  { angle: 90, stops: ["#3A6073 0%", "#16222A 100%"] },
  { angle: 90, stops: ["#8E2DE2 0%", "#4A00E0 50%", "#00BCD4 100%"] },
  { angle: 90, stops: ["#00C6FF 0%", "#0072FF 100%"] },
];

/* --------- Utils --------- */
const cssFrom = (g: GradientItem) => `linear-gradient(${g.angle}deg, ${g.stops.join(", ")})`;
const stopHex = (s: GradStop) => s.trim().split(/\s+/)[0].toUpperCase();
const copy = (t: string) => navigator.clipboard.writeText(t).catch(() => {});

/* --------- Modal con Portal (centrado y por encima) --------- */
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal
      role="dialog"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.dataset.backdrop === "true") onClose();
      }}
    >
      {/* Backdrop */}
      <div
        data-backdrop="true"
        className="absolute inset-0 bg-black/60"
      />
      {/* Contenido */}
      <div className="relative z-[101] w-[92vw] max-w-[720px] max-h-[88vh] overflow-auto rounded-2xl bg-neutral-950 text-white ring-1 ring-white/10">
        {children}
      </div>
    </div>,
    document.body
  );
}

/* --------- Componente principal --------- */
export default function GradientCards({
  items = GRADIENTS,
  title = "Gradientes / Degradados",
}: {
  items?: GradientItem[];
  title?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const opened = openIndex !== null ? items[openIndex] : null;
  const css = useMemo(() => (opened ? cssFrom(opened) : ""), [opened]);

  return (
    <section className="w-full">
      <h2 className="mb-4 text-xl sm:text-2xl font-semibold">{title}</h2>

      {/* Grid de tarjetas (SIN grados ni botón ⋯) */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((g, idx) => (
          <article
            key={idx}
            className="relative overflow-hidden rounded-[22px] ring-1 ring-white/10 hover:ring-white/20 transition"
          >
            {/* Tarjeta clickeable */}
            <button
              onClick={() => setOpenIndex(idx)}
              className="block h-[240px] w-full sm:h-[280px] rounded-[22px]"
              style={{ backgroundImage: cssFrom(g) }}
              aria-label="Abrir detalle del degradado"
            />

            {/* Paleta superpuesta */}
            <div className="relative -mt-6 flex justify-center pb-4">
              <div className="flex items-center gap-4 rounded-[26px] bg-white px-5 py-3 shadow-lg">
                {g.stops.map((s, i) => (
                  <span
                    key={i}
                    className="h-8 w-8 rounded-full ring-1 ring-black/10"
                    style={{ background: stopHex(s) }}
                    title={s}
                  />
                ))}
              </div>
            </div>

            {/* Códigos debajo */}
            <div className="flex flex-wrap items-center gap-2 bg-white/5 px-4 py-3 text-xs sm:text-sm font-mono">
              {g.stops.map((s, i) => (
                <span key={i} className="rounded bg-black/20 px-2 py-0.5">{s}</span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {/* MODAL centrado y superpuesto */}
      <Modal open={openIndex !== null} onClose={() => setOpenIndex(null)}>
        {opened && (
          <>
            <div className="flex items-center justify-between px-4 py-3">
              <div className="text-lg font-medium">Detalle del degradado</div>
              <button onClick={() => setOpenIndex(null)} className="rounded px-2 py-1 hover:bg-white/10">✕</button>
            </div>

            {/* Preview */}
            <div className="px-4 pb-5">
              <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
                <div className="px-3 py-2 text-sm bg-white/5">Vista previa</div>
                <div className="h-56 sm:h-72" style={{ backgroundImage: css }} />
              </div>

              {/* Stops y CSS */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="mb-2 text-sm font-medium">Colores usados</div>
                  <ul className="space-y-2">
                    {opened.stops.map((s, i) => (
                      <li key={i} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="h-6 w-6 rounded-full ring-1 ring-white/20" style={{ background: stopHex(s) }} />
                          <span className="font-mono text-xs sm:text-sm">{stopHex(s)}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-white/70">
                          {s.split(/\s+/).slice(1).join(" ") || ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                  <div className="mb-2 text-sm font-medium">CSS</div>
                  <code className="block max-h-40 overflow-auto rounded bg-black/30 p-3 text-xs sm:text-sm">
                    background-image: {css};
                  </code>
                  <div className="mt-2">
                    <button
                      onClick={() => copy(`background-image: ${css};`)}
                      className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm hover:bg-white/20"
                    >
                      Copiar CSS
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-white/60">Clic fuera (oscuro) o presiona ESC para cerrar.</p>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}
