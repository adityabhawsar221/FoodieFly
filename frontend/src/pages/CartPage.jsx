import React from 'react'
import { IoArrowBackSharp } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../components/CartItemCard';
import { RiMoneyRupeeCircleFill } from "react-icons/ri";


function CartPage() {
  const navigate = useNavigate();
  const {cartItems , totalAmount} = useSelector(state=>state.user);
  return (
    <div className='min-h-screen bg-[#fff0e6] flex justify-center p-6'>
      <div className='w-full max-w-[800px]'>
        {/* back button */}
        <div className='flex items-center gap-4 mb-4' onClick={()=>navigate("/")}>
           {/* back button */}  
          <div className="z-[10]">
            <IoArrowBackSharp
              size={35}
              className=" text-[#ff4d2d] cursor-pointer"
              onClick={() => navigate("/")}
            />     
          </div>
          <h1 className='text-2xl font-bold text-start'>My Cart</h1>         
        </div>
        {/* cards */}
        {cartItems.length == 0 ? (
          <p className='text-center text-lg text-gray-500'>Your cart is empty</p>
        ) : (
        <>
          <div className='flex flex-col gap-4'>
            {cartItems.map((item,idx)=>(
              <CartItemCard key={idx} data={item} />
            ))}
          </div>
          {/* total amount */}
          <div className='mt-6 bg-white p-4 rounded-xl shadow-xl flex justify-between items-center border text-red-500'>
            <h1 className='font-bold text-lg'>Total Amount</h1>
            <span className='font-bold text-2xl'><RiMoneyRupeeCircleFill size={30} className='inline mb-1' />{totalAmount}/-</span>
          </div>
          {/* check out */}
          <div className='mt-4 flex justify-end' >
              <button className='bg-[#ff4d2d] text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-[#e64526] transition cursor-pointer' onClick={()=>navigate("/checkout")}>Proceed To Checkout</button>
          </div>
        </>
        )}
      </div>
    </div>
  )
}

export default CartPage