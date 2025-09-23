import React from 'react'
import Paleta from './selector-paleta/Paleta'

export default function Home() {
  return (
    <div>
      <h1 className='text-center text-2xl text-white mt-10'>COLORES HTML</h1>
      <div>
        <p className='text-white mt-10 text-center mb-10'>
          Todos los colores con código disponibles para tus 
          proyectos de programación o de diseño gráfico
          totalmente gratis!!
        </p>
      </div>
      <Paleta/>
    </div>
  )
}
