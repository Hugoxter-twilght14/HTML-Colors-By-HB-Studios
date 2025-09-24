"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ---------- Conversión de color (HEX/HSV/RGB) ---------- */
type RGB = { r: number; g: number; b: number };
type HSV = { h: number; s: number; v: number }; // h: 0-360, s/v: 0-100

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

function hexToRgb(hex: string): RGB {
  const s = hex.replace("#", "");
  const f = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  const n = parseInt(f, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex({ r, g, b }: RGB) {
  const t = (v: number) => v.toString(16).padStart(2, "0");
  return (`#${t(r)}${t(g)}${t(b)}`).toUpperCase();
}
function rgbToHsv({ r, g, b }: RGB): HSV {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    switch (max) {
      case R: h = ((G - B) / d + (G < B ? 6 : 0)) * 60; break;
      case G: h = ((B - R) / d + 2) * 60; break;
      default:  h = ((R - G) / d + 4) * 60;
    }
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s: s * 100, v: v * 100 };
}
function hsvToRgb({ h, s, v }: HSV): RGB {
  const H = (h % 360 + 360) % 360;
  const S = clamp(s, 0, 100) / 100;
  const V = clamp(v, 0, 100) / 100;
  const c = V * S;
  const x = c * (1 - Math.abs(((H / 60) % 2) - 1));
  const m = V - c;
  let R = 0, G = 0, B = 0;
  if (H < 60)      { R = c; G = x; }
  else if (H < 120){ R = x; G = c; }
  else if (H < 180){ G = c; B = x; }
  else if (H < 240){ G = x; B = c; }
  else if (H < 300){ R = x; B = c; }
  else             { R = c; B = x; }
  return { r: Math.round((R + m) * 255), g: Math.round((G + m) * 255), b: Math.round((B + m) * 255) };
}
const hexToHsv = (hex: string) => rgbToHsv(hexToRgb(hex));
const hsvToHex = (hsv: HSV) => rgbToHex(hsvToRgb(hsv));
const isValidHex = (hex: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);

/* ---------- Componente: gotero inline ---------- */
export default function InLineEyedropper({
  value = "#FF0000",
  onChange,          
  className = "text-2xl",
  title = "Selector de color",
}: {
  value?: string;
  onApply: (hex: string) => void;
  onChange?: (hex: string) => void;
  className?: string;
  title?: string;
}) {
  const [hsv, setHsv] = useState<HSV>(() => hexToHsv(value));
  const hex = useMemo(() => hsvToHex(hsv), [hsv]);

  // sincroniza valor inicial (por si te llega de afuera)
  useEffect(() => { setHsv(hexToHsv(value)); }, [value]);

  // avisa cambios en vivo si lo piden
  useEffect(() => { onChange?.(hex); }, [hex, onChange]);

  /* ----- Arrastre en el cuadro S/V ----- */
  const svRef = useRef<HTMLDivElement>(null);

  const handleSV = (clientX: number, clientY: number) => {
    const el = svRef.current!;
    const rect = el.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const y = clamp(clientY - rect.top, 0, rect.height);
    const s = (x / rect.width) * 100;
    const v = (1 - y / rect.height) * 100;
    setHsv((p) => ({ ...p, s, v }));
  };

  const startSV = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();

    if ("touches" in e) {
      const t = e.touches[0];
      if (t) handleSV(t.clientX, t.clientY);
    } else {
      handleSV(e.clientX, e.clientY);
    }

    const moveMouse = (ev: MouseEvent) => handleSV(ev.clientX, ev.clientY);
    const stopMouse = () => { window.removeEventListener("mousemove", moveMouse); window.removeEventListener("mouseup", stopMouse); };
    const moveTouch = (ev: TouchEvent) => { const t = ev.touches[0]; if (t) handleSV(t.clientX, t.clientY); };
    const stopTouch = () => { window.removeEventListener("touchmove", moveTouch); window.removeEventListener("touchend", stopTouch); };

    window.addEventListener("mousemove", moveMouse);
    window.addEventListener("mouseup", stopMouse);
    window.addEventListener("touchmove", moveTouch, { passive: false });
    window.addEventListener("touchend", stopTouch);
  };

  /* ----- Barra de Hue ----- */
  const hueRef = useRef<HTMLDivElement>(null);

  const handleHue = (clientX: number) => {
    const el = hueRef.current!;
    const rect = el.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const h = (x / rect.width) * 360;
    setHsv((p) => ({ ...p, h }));
  };

  const startHue = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();

    if ("touches" in e) {
      const t = e.touches[0];
      if (t) handleHue(t.clientX);
    } else {
      handleHue(e.clientX);
    }

    const moveMouse = (ev: MouseEvent) => handleHue(ev.clientX);
    const stopMouse = () => { window.removeEventListener("mousemove", moveMouse); window.removeEventListener("mouseup", stopMouse); };
    const moveTouch = (ev: TouchEvent) => { const t = ev.touches[0]; if (t) handleHue(t.clientX); };
    const stopTouch = () => { window.removeEventListener("touchmove", moveTouch); window.removeEventListener("touchend", stopTouch); };

    window.addEventListener("mousemove", moveMouse);
    window.addEventListener("mouseup", stopMouse);
    window.addEventListener("touchmove", moveTouch, { passive: false });
    window.addEventListener("touchend", stopTouch);
  };

  /* ----- Input HEX ----- */
  const [hexInput, setHexInput] = useState<string>(value.toUpperCase());
  useEffect(() => setHexInput(hex), [hex]);
  const applyHexInput = () => { if (isValidHex(hexInput)) setHsv(hexToHsv(hexInput)); };

  /* ----- fondos ----- */
  const hueBg =
    "linear-gradient(90deg,#FF0000 0%,#FFFF00 17%,#00FF00 33%,#00FFFF 50%,#0000FF 67%,#FF00FF 83%,#FF0000 100%)";
  const svHueColor = hsvToHex({ h: hsv.h, s: 100, v: 100 });
  const svBg = `linear-gradient(0deg,#000 0%,rgba(0,0,0,0) 100%),
                linear-gradient(90deg,#fff 0%,${svHueColor} 100%)`;

  const svX = `${clamp(hsv.s, 0, 100)}%`;
  const svY = `${100 - clamp(hsv.v, 0, 100)}%`;
  const hueX = `${(hsv.h / 360) * 100}%`;

  return (
    <div className={["rounded-2xl bg-neutral-800 p-4 shadow-2xl ring-1 ring-black/30", className].join(" ")}>
      <div className="mb-3 text-base font-medium text-white/90">{title}</div>

      {/* Cuadro S/V */}
      <div
        ref={svRef}
        className="relative mx-auto h-[260px] w-full max-w-[360px] rounded-xl border border-white/10"
        style={{ backgroundImage: svBg }}
        onMouseDown={startSV}
        onTouchStart={startSV}
      >
        <span
          className="pointer-events-none absolute -mt-3 -ml-3 h-6 w-6 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,.35)]"
          style={{ left: svX, top: svY }}
        />
      </div>

      {/* Hue */}
      <div
        ref={hueRef}
        className="relative mx-auto mt-4 h-8 w-full max-w-[360px] cursor-pointer rounded-full border border-white/10"
        style={{ backgroundImage: hueBg }}
        onMouseDown={startHue}
        onTouchStart={startHue}
      >
        <span
          className="pointer-events-none absolute -mt-2 -ml-2 h-6 w-6 rounded-full border-2 border-white bg-white shadow-[0_0_0_2px_rgba(0,0,0,.35)]"
          style={{ left: hueX, top: "50%" }}
        />
      </div>

      {/* HEX */}
      <div className="mx-auto mt-4 flex w-full max-w-[360px] items-center gap-3">
        <input
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value.toUpperCase())}
          onBlur={applyHexInput}
          placeholder="#FFFFFF"
          className="w-full rounded-lg border border-white/10 bg-white px-3 py-2 font-mono text-neutral-900"
        />
        <span className="h-11 w-14 rounded-lg ring-1 ring-black/20" style={{ background: hex }} />
      </div>

    

      <p className="mt-3 text-center text-xs text-white/60">
        Arrastra en el cuadro, mueve el control de color o escribe un HEX.
      </p>
    </div>
  );
}
