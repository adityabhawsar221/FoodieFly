import React, { useState } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { serverUrl } from "../App";
import axios from "axios";
import { updateOrderStatus } from "../redux/userSlice";
import { useDispatch } from "react-redux";

function OwnerOrderCard({ data }) {
  const [availableBoys , setAvailableBoys] = useState([]);
  const dispatch = useDispatch();
  const handleUpdateStatus = async(orderId , shopId , status) => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`,{status} , {withCredentials:true});
      const shouldMarkPaid = status === "delivered" && data.paymentMethod === "cod";
      dispatch(updateOrderStatus({orderId , shopId , status, payment: shouldMarkPaid ? true : undefined}));
      console.log(result.data);
      setAvailableBoys(result.data.availableBoys);
    } catch (error) {
      console.error(error);
    } 
  }
  return (
    <div className=" bg-white rounded-lg shadow p-4 space-y-4">
      <div className="">
        <h2 className="text-lg font-semibold text-gray-800">{data.user.fullname}</h2>
        <p className="text-sm text-gray-500">{data.user.email}</p>
        <p className="flex items-center gap-2 text-sm mt-1 text-gray-600"><FaPhoneAlt /> <span>{data.user.mobile}</span></p>
        <div className="text-sm text-gray-700 space-y-1">
          <p className="mt-2">
            Payment Method: <span className="font-medium">{data.paymentMethod}</span>
          </p>
          <p>
            Payment Status:{" "}
            <span className={data.payment ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>
              {data.payment ? "Paid" : "Pending"}
            </span>
          </p>
        </div>
      </div>
      {/* addresss */}
      <div className="flex items-start flex-col gap-2 text-gray-600 text-sm">
        <p>{data?.deliveryAddress.text}</p>
        <p className="text-xs text-gray-500">Lat: {data?.deliveryAddress.latitude} , Lon: {data?.deliveryAddress.longitude}</p>
      </div>
      {/* items */}
      <div className='flex space-x-4 overflow-x-auto pb-2'>
        {data.shopOrders.shopOrderItems?.map((item, idx) => (
          <div className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white' key={idx}>
            <img src={item.item.image} alt={item.name} className='w-full h-24 object-cover rounded' />
            <p className='text-sm font-semibold mt-1'>{item.name}</p>
            <p className='text-xs text-gray-700'>Qty: {item.quantity} X ₹{item.price}</p>
          </div>
        ))}
      </div>
      {/* status */}
      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
        <span className="text-sm">status : <span className="font-semibold capitalize text-[#ff4d2d]">{data.shopOrders.status}</span> </span>

        <select className="rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d] cursor-pointer " onChange={(e)=>handleUpdateStatus(data._id , data.shopOrders.shop._id , e.target.value)}>
          <option value="pending">change</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="out of delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>  
      {/* available delivery boys */}
      {data.shopOrders.status === 'out of delivery' && (
        <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50">
          {data.shopOrders.assignedDeliveryBoy ? <p>Assigned Delivery Boy:</p>  : <p>Available Delivery Boys:</p>  }
          {availableBoys.length > 0 ? (
            availableBoys.map((b,i)=>(
              <div className="text-gray-800" key={i}>{b.fullname}-{b.mobile}</div>
            )) 
          ): 
         data.shopOrders.assignedDeliveryBoy ? <div>{data.shopOrders.assignedDeliveryBoy.fullname}-{data.shopOrders.assignedDeliveryBoy.mobile}</div> : <div>No delivery boys available</div> 
          }
        </div>

      )}
      {/* total */}
      <div className="text-right font-bold text-gray-800 text-sm">
        Total: ₹ {data.shopOrders.subTotal}
      </div>
    </div>
  );
}

export default OwnerOrderCard;
