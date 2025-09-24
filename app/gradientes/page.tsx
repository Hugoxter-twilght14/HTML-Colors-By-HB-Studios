// app/gradientes/page.tsx
import GradientCards, { GRADIENTS } from "./components/GradientCards";

export default function GradientesPage() {
  return (
    <main>
      {/* Puedes pasar GRADIENTS o construir tu propio array aquí */}
      <GradientCards items={GRADIENTS} />
    </main>
  );
}
