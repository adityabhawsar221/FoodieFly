import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoArrowBackSharp } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { setMyOrders, updateRealtimeOrderStatus } from '../redux/userSlice';

function MyOrders() {
  const navigate = useNavigate();
  const { userData, myOrders , socket } = useSelector(state => state.user);
  const dispatch = useDispatch();
  useEffect(()=>{
    socket?.on("newOrder" , (data)=>{
      if(data.shopOrders.owner._id === userData._id){
          dispatch(setMyOrders([data,...myOrders]));
      }
    })
    socket?.on("update-status" , ({orderId , shopId , status , userId})=>{
      if(userData._id === userId){
        dispatch(updateRealtimeOrderStatus({orderId , shopId , status}));
      }
    });
    return ()=>{
      socket?.off("newOrder");
      socket?.off("update-status");
    }
  }, [socket]);
  return (
    <div className='w-full min-h-screen bg-[#fff0e6] flex justify-center px-4 py-8'>
      <div className='w-full max-w-[900px]'>
        {/* header */}
        <div className='bg-white/90 backdrop-blur rounded-2xl shadow-lg ring-1 ring-orange-100 p-5 mb-6'>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              className='inline-flex items-center justify-center h-10 w-10 rounded-full bg-orange-50 text-[#ff4d2d] hover:bg-orange-100 transition'
              onClick={() => navigate("/")}
              aria-label='Go back'
            >
              <IoArrowBackSharp size={20} />
            </button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>My Orders</h1>
              <p className='text-sm text-gray-500'>Track and manage your recent orders</p>
            </div>
          </div>
        </div>

        {/* orders list */}
        <div className='space-y-6'>
          {myOrders?.length ? (
            myOrders.map((order, i) => (
              userData?.role === "user" ? (
                <UserOrderCard key={i} data={order} />
              ) : userData?.role === "owner" ? (
                <OwnerOrderCard key={i} data={order} />
              ) : null
            ))
          ) : (
            <div className='bg-white/90 rounded-2xl p-6 text-center text-gray-600 shadow-sm ring-1 ring-orange-100'>
              No orders yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyOrders