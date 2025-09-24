export default function AcercaPage() {
  return (
    <main className="prose prose-invert max-w-none">
      <h1 className="text-white">Acerca de</h1>
      <p className="text-white">
        App de colores HTML hecha para programadores y diseñadores.
      </p>
      <h2 className="text-yellow-300">Desarrollado por HB Studios</h2>
      <ul className="text-white">
        <li>Contacto: hbstudiosoficial14@gmail.com</li>
        <p>Sitio Web oficial:
          <a
            href="https://hb-studios-official.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          > 
            https://hb-studios-official.vercel.app/
          </a>
        </p>
      </ul>
      <p className="text-zinc-600">© 2025 - {new Date().getFullYear()} ! HB Sturiods - All Rigths Reserved.</p>
    </main>
  );
}
