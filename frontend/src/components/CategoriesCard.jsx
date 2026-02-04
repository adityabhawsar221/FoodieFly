import React from 'react'

function CategoriesCard({ name , image , onClick}) {
  return (
    <div className='w-[120px] h-[120px] md:w-[180px] md:h-[180px] bg-white rounded-2xl shadow-xl border-[#ff4d2d] border-2 shrink-0 overflow-hidden shadow-gray-200  cursor-pointer hover:shadow-lg transition-shadow duration-200 relative' onClick={onClick}>
      <img src={image} alt={name} className='w-full h-full object-cover transform hover:scale-110 transition-transform duration-300' />
      <div className='absolute bottom-0 w-full left-0 bg-[#ffffff96] bg-opacity-95 px-3 py-1 rounded-t-xl text-center shadow text-sm font-medium text-gray-800 backdrop-blur'>{name}</div>
      </div>
  )
}

export default CategoriesCard