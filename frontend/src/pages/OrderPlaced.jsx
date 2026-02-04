import React from 'react'
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
function OrderPlaced() {
  const navigate = useNavigate();

  return (
  
    <div className='min-h-screen bg-[#fff0e6] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden' >
        <FaCheckCircle className='text-green-500 text-6xl mb-4'/>
        <h1 className='text-3xl font-bold text-gray-800 mb-2'>Order Placed Successfully!</h1>
        <p className='text-gray-600 mb-6 max-w-md'>Thank you for your order. Your delicious food is being prepared. You can track your order in the "My Orders" section.</p>
        <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 px-6 rounded-lg font-medium transition text-lg' onClick={() => navigate("/my-orders")}>Go to My Orders</button>
    </div>
  )
}

export default OrderPlaced