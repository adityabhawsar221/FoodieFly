import React, { useState } from 'react'
import { RiMoneyRupeeCircleFill } from "react-icons/ri";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';

function CartItemCard({ data }) {
  const dispatch = useDispatch();

  const handleIncrement = (id , currentQty) => {
    dispatch(updateQuantity({id , quantity: currentQty + 1}))
  };
  const handleDecrement = (id , currentQty) => {
    if (currentQty > 1) {
      dispatch(updateQuantity({id , quantity: currentQty - 1}))
    }
  };
  return (
    <div className='flex items-center justify-between bg-white p-4 rounded-xl shadow border'>
      {/* left part  */}
      <div className='flex items-center gap-4'>
        <img src={data.image} alt={data.name} className='w-20 h-20 object-cover rounded-lg border' />
        <div>
          <h1 className='text-gray-800 font-medium'>{data.name}</h1>
          <p className='text-sm text-gray-500'>₹{data.price} x {data.quantity}</p>
          <p className='font-bold text-gray-900 flex items-center'><RiMoneyRupeeCircleFill size={20} className='text-green-500' />{data.price * data.quantity}</p>
        </div>
      </div>
      {/* right part  */}
      <div className='flex items-center gap-3'>
        <button
          onClick={()=>handleDecrement(data.id , data.quantity)}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-400 cursor-pointer"
        >
          <FaMinus size={12} />
        </button>
        {/* quantity */}
        <span>{data.quantity}</span>
        {/* plus */}
        <button
          onClick={()=>handleIncrement(data.id , data.quantity)}
          className="p-2 bg-gray-200 rounded-full hover:bg-gray-400 cursor-pointer"
        >
          <FaPlus size={12} />
        </button>
        <button className='p-2 bg-red-100 rounded-full hover:bg-red-200 cursor-pointer' onClick={()=>dispatch(removeCartItem(data.id))}>
          <MdDelete size={25} className='text-red-500' />
        </button>
      </div>
    </div>
  )
}

export default CartItemCard