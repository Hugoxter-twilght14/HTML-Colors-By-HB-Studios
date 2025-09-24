"use client"
export default function InformacionGeneral() {
  const anioActual = new Date().getFullYear();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-center space-y-8">
      <h1 className="text-3xl font-semibold text-white">Acerca De</h1>

      <p className="text-gray-300 text-lg">
        Bienvenido a <span className="font-bold text-white">HTML Colors By HB Studios</span>, Una herramienta creada para desarrolladores UI/UX
        <br/> y diseñadores, totalmente gratis.
      </p>

      <div className="bg-gray-800 rounded-xl p-6 shadow-md text-left space-y-3">
        <p className="text-yellow-500"><span className="font-semibold text-white">Versión de la App:</span> 1.4.0</p>
        <p className="text-yellow-500"><span className="font-semibold text-white">Nombre de la aplicación:</span> HTML Colors By HB Studios</p>
        <p className="text-yellow-500"><span className="font-semibold text-white">Nombre del desarrollador:</span> HB Studios</p>
        <p className="text-yellow-500"><span className="font-semibold text-white">Fecha de creación:</span> © 2025 - {anioActual}</p>
        <p className="text-yellow-500"><span className="font-semibold text-white">Correo de contacto:</span> hbstudiosoficial14@gmail.com</p>
        <p>
          <span className="font-semibold text-white">Sitio web oficial:</span>{' '}
          <a
            href="https://hb-studios-official.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            https://hb-studios-official.vercel.app/
          </a>
        </p>
      </div>
    </div>
  );
}
