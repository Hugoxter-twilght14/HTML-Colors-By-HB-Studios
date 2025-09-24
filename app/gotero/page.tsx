"use client";

import React, { useState } from "react";
import InlineEyedropper from "./components/InLineEyedropper";

export default function GoteroPage() {
  const [color, setColor] = useState("#FF6B00");

  return (
    <main className="space-y-4">
      <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 text-white">
        <InlineEyedropper
          value={color}
          onApply={(hex) => setColor(hex)}
          title="Selector de color"
          className="mt-3"
        />
      </div>
    </main>
  );
}
