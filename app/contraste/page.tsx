// app/contraste/page.tsx
import ContrastGrid, { CONTRAST_SETS } from "./components/ContrastGrid";

export default function ContrastePage() {
  return (
    <main>
      <ContrastGrid items={CONTRAST_SETS} />
    </main>
  );
}
