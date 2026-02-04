import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useParams } from 'react-router-dom';
import { IoArrowBackSharp } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import DeliveryBoyTracking from '../components/DeliveryBoyTracking';
import { useSelector } from 'react-redux';

function TrackOrderPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [currentOrder, setCurrentOrder] = useState(null);
  const { socket } = useSelector(state => state.user);
  const [liveLocations, setLiveLocations] = useState({});
  const handleGetOrder = async (orderId) => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true });
      setCurrentOrder(result.data);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect(() => {
    handleGetOrder(orderId);
  }, [orderId]);

  useEffect(() => {
    if (!socket) return;

    const handler = ({ deliveryBoyId, latitude, longitude }) => {
      setLiveLocations((prev) => ({
        ...prev,
        [deliveryBoyId]: { lat: latitude, lon: longitude }
      }))
    };

    socket.on("updateDeliveryLocation", handler);
    return () => socket.off("updateDeliveryLocation", handler);
  }, [socket]);
  return (
    <div className='min-h-screen bg-[#fff0e6] px-4 py-6 md:px-8 flex flex-col gap-6'>
      {/* back button */}
      <div className='flex items-center gap-3'>
        <button
          type='button'
          onClick={() => navigate("/")}
          className='h-10 w-10 rounded-full bg-white border border-orange-100 shadow-sm flex items-center justify-center hover:shadow-md transition'
          aria-label='Go back'
        >
          <IoArrowBackSharp size={22} className='text-[#ff4d2d]' />
        </button>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Track Order</h1>
          <p className='text-sm text-gray-500'>Real-time delivery updates</p>
        </div>
      </div>

      <div className='grid gap-6'>
        {currentOrder?.shopOrders?.map((shopOrder, idx) => (
          <div className='w-full bg-white p-5 rounded-2xl shadow-sm border border-orange-100 space-y-4' key={idx}>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='font-bold text-lg text-[#ff4d2d]'>{shopOrder.shop.name}</p>
                <p className='text-xs text-gray-500'>Order #{idx + 1}</p>
              </div>
              <span className='px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600'>
                {shopOrder.status}
              </span>
            </div>

            <div className='text-sm text-gray-700 space-y-2'>
              <p className='font-medium'>
                <span className='text-gray-500'>Items: </span>
                {shopOrder.shopOrderItems?.map(item => item.name).join(", ")}
              </p>
              <p className='font-medium'>
                <span className='text-gray-500'>SubTotal: </span>
                <span className='capitalize text-[#ff4d2d] font-semibold'>{shopOrder.subTotal}</span>
              </p>
              <p>
                <span className='text-gray-500 font-medium'>Delivery Address: </span>
                {currentOrder?.deliveryAddress?.text}
              </p>
            </div>
            {/* map */}
            {shopOrder.status !== 'delivered' ? (
              <div className='rounded-xl border border-orange-100 bg-orange-50/40 p-3'>
                {shopOrder.assignedDeliveryBoy ? (
                  <div className='text-sm text-gray-700 space-y-1'>
                    <p className='font-semibold'><span className='text-gray-500'>Delivery Boy: </span>{shopOrder.assignedDeliveryBoy.fullname}</p>
                    <p className='font-semibold'><span className='text-gray-500'>Mobile: </span>{shopOrder.assignedDeliveryBoy.mobile}</p>
                  </div>
                ) : (
                  <p className='text-gray-600 text-sm'>No delivery boy assigned yet</p>
                )}
              </div>
            ) : (
              <div className='rounded-xl bg-green-50 text-green-700 font-semibold text-sm px-3 py-2'>Delivered</div>
            )}

            {shopOrder.assignedDeliveryBoy && shopOrder.status !== 'delivered' && (
              <div className='rounded-xl overflow-hidden border border-gray-100'>
                <DeliveryBoyTracking data={{
                  deliveryBoyLocation: liveLocations[shopOrder.assignedDeliveryBoy._id] || 
                  {
                    lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                    lon: shopOrder.assignedDeliveryBoy.location.coordinates[0]
                  },
                  customerLocation: {
                    lat: currentOrder.deliveryAddress.latitude,
                    lon: currentOrder.deliveryAddress.longitude
                  }
                }} />
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}

export default TrackOrderPage