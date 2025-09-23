"use client"
import React from 'react'
import PaletaColores from './components/PaletaColores/PaletaColores'
import BuscadorColor from './components/BuscadorColores/BuscadorColores';

export default function Paleta() {
    
const seeds = [
    "#E35342","#FFB11E","#FF4966","#9E2997", // rojizos / magentas
    "#9C93E5","#C7A3D2","#BA8CBE","#7F4EA8", // morados
    "#F5EDF0","#DCBDDF","#9A99E1","#008BD0", // lilas→azules
    "#201C57","#201C6D","#1E1A84","#2D198E","#411A8D", // azules oscuros
    "#E0AA00","#FFA61D",                          // naranjas/amarillos
    "#0084C7","#00BCD4","#03A9F4","#2196F3",     // azules
    "#4CAF50","#8BC34A","#CDDC39",               // verdes
    "#795548","#607D8B","#9E9E9E",               // neutros
    "#000000","#FFFFFF", 
    "#FF007A","#00FF88","#222222","#f0f0f0",

  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 text-white">
      <h1 className="mb-2 text-center text-3xl font-semibold tracking-wide">COLORES HTML</h1>
      <p className="mb-8 text-center text-sm text-white/70">
        Busca tu color en código HEX o RGB; Haz clic en cualquier color para ver su familia.
      </p>

      <div className="mb-8">
        <BuscadorColor familySteps={5} dotSize={44} />
      </div>

      
      <PaletaColores
        title="Tabla de colores"
        seeds={seeds}
        columns={10}
        dotSize={40}
        familySteps={5}
      />
    </main>
  );
}
