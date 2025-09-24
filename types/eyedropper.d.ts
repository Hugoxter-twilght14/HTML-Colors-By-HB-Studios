// Tipos mínimos para la EyeDropper API (Chromium).
// Se cargan globalmente; no necesitas importarlos.

declare global {
  interface EyeDropperResult {
    sRGBHex: string;
  }

  interface EyeDropper {
    open: () => Promise<EyeDropperResult>;
  }

  interface Window {
    EyeDropper?: new () => EyeDropper;
  }
}

export {};
