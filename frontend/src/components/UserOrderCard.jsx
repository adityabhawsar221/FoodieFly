import axios from 'axios';
import React from 'react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';

function UserOrderCard({ data }) {
  const navigate = useNavigate()
  const [selectedRating , setSelectedRating] = useState({}); // itemId : rating
  const [ratingMsg, setRatingMsg] = useState({}); // itemId : message
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB' , {
      day:'2-digit',
      month:'short',
      year:'numeric',
    });
  }
  const handleRating = async(itemId , rating) => {
    try {
      // If user already rated in this session, avoid re-sending
      if (selectedRating[itemId]) {
        setRatingMsg((prev) => ({ ...prev, [itemId]: "You already rated this item" }));
        return;
      }
      const result = await axios.post(`${serverUrl}/api/item/rating` , { 
        itemId,
        rating
      } , {withCredentials:true});
      setSelectedRating((prev)=>({
        ...prev,
        [itemId]:rating
      }))
      setRatingMsg((prev) => ({ ...prev, [itemId]: "Thanks for rating!" }));
    } catch (error) {
      const status = error?.response?.status;
      if (status === 409) {
        setRatingMsg((prev) => ({ ...prev, [itemId]: "You already rated this item" }));
        return;
      }
      setRatingMsg((prev) => ({ ...prev, [itemId]: "Rating failed. Please try again." }));
      console.error(error);
    }
  }
  return (
    <div className=' bg-white rounded-lg shadow p-4 space-y-4'>
        <div className='flex justify-between border-b pb-2'>
          {/* left */}
           <div>
            <p className='font-semibold'>
              order #{data?._id?.slice(0,6)?.toUpperCase() || '------'}
            </p>
            <p className='text-gray-500 text-sm'>
              Date: {formatDate(data?.createdAt)}
            </p>
           </div>
          {/* right */}
          <div className='text-right'>
            <p className='text-gray-500 text-sm'>Payment Method: {data.paymentMethod?.toUpperCase()}</p>
            <p className={data.payment ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
              Payment: {data.payment ? 'Paid' : 'Pending'}
            </p>
          </div>
        </div>
        {/* shop wise list */}

          {data.shopOrders?.map((shopOrder , index) => (
            <div className='border rounded-lg p-3 bg-[#fffaf7] space-y-3' key={index}>
                <p>{shopOrder.shop?.name}</p>
                 {/* items */}
                <div className='flex space-x-4 overflow-x-auto pb-2'>
                  {shopOrder.shopOrderItems?.map((item , idx)=>(
                    <div className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white' key={idx}>
                      <img src={item.item.image} alt={item.name} className='w-full h-24 object-cover rounded' />
                      <p className='text-sm font-semibold mt-1'>{item.name}</p>
                      <p className='text-xs text-gray-700'>Qty: {item.quantity} X ₹{item.price}</p>
                      {shopOrder.status === "delivered" && (
                        <div className='mt-2'>
                        <div className='flex space-x-1'>
                         { [1,2,3,4,5].map((star)=>(
                          <button
                            className={`${selectedRating[item.item._id]>= star ? 'text-yellow-400' : 'text-gray-400'} text-lg cursor-pointer`}
                            key={star}
                            onClick={()=>handleRating(item.item._id , star)}
                            disabled={Boolean(selectedRating[item.item._id])}
                            title={selectedRating[item.item._id] ? 'You already rated this item' : 'Rate this item'}
                          >
                            ★
                          </button>
                         ))}
                        </div>
                        {ratingMsg[item.item._id] && (
                          <p className='text-[11px] mt-1 text-gray-500'>{ratingMsg[item.item._id]}</p>
                        )}
                        </div>
                        )
                      }
                    </div>
                  ))}
                </div>
                {/* total */}
                <div className='flex justify-between border-t items-center pt-2' >
                  <p className='font-semibold'>Subtotal : ₹{shopOrder.subTotal}</p>
                  <span className='text-blue-600 text-sm font-medium'>Status : {shopOrder.status}</span>
                </div>
                {/* total price */}
                <div className='flex justify-between items-center pt-2 border-t'>
                  <p className='font-semibold '>Total Price : ₹{data.totalAmount}</p>
                  <button className='bg-[#ff4d2d] hover:bg-[#e64526] text-white px-4 py-2 rounded-lg text-sm' onClick={()=>navigate(`/track-order/${data._id}`)}>Track Order</button>
                </div>
            </div>
          ))}

    </div>
  )
}

export default UserOrderCard;