import { useState , useEffect} from 'react'
import Nav from '../pages/Nav'
import { useSelector } from 'react-redux'
import { serverUrl } from '../App';
import axios from 'axios';
import DeliveryBoyTracking from './DeliveryBoyTracking';

function DeliveryBoy() {
  const {userData , socket} = useSelector(state=>state.user);
  const [availableAssignments , setAvailableAssignments] = useState([]);
  const [showOtpBox , setShowOtpBox] = useState(false);
  const [currentOrder , setCurrentOrder] = useState(null);
  const [otp , setOtp] = useState("");
  const [deliveryBoyLocation , setDeliveryBoyLocation] = useState(null);
  const getAssignments = async function(){
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments` , {withCredentials:true});
      setAvailableAssignments(result.data);
    } catch (error) {
      console.error(error);
    }
  }

  const acceptOrder = async function(assignmentId){
    try{
       const result = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, {withCredentials:true});
       await getCurrentOrder();

    }catch(error){
      console.error(error);
    }
  }

  const getCurrentOrder = async function(){
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, {withCredentials:true});
      setCurrentOrder(result.data);

    } catch (error) {
      console.error(error);
    }
  }

  useEffect(()=>{
    getAssignments();
    getCurrentOrder();
  },[userData])

  const sendOtp = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/send-delivery-otp`, {orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id}, {withCredentials:true});
      console.log("OTP sent to user" , result.data);
      setShowOtpBox(true);
    } catch (error) {
      console.error(error);
    }
  }
  const verifyOtp = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`,  {orderId: currentOrder._id, shopOrderId: currentOrder.shopOrder._id, otp}, {withCredentials:true});
      console.log("OTP verified , order delivered" , result.data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(()=>{
    socket?.on("newAssignment" , (data)=>{
      if(data.sentTo === userData._id){
        setAvailableAssignments(prev => [...prev , data]);
      }
    });
    return ()=>{
      socket?.off("newAssignment");
    }
  }, [availableAssignments , socket , userData]);

  useEffect(()=>{
    if (!socket) return;
    if (userData?.role !== "deliveryBoy") return;
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setDeliveryBoyLocation({ lat: latitude, lon: longitude });
        socket.emit('updateLocation' , { 
          latitude, 
          longitude,
          userId: userData._id
        });
      },
      (error) => {
        console.error("Error getting location: ", error);
      },
      {
        enableHighAccuracy: true,
      }
    );

    return ()=>{
      navigator.geolocation.clearWatch(watchId);
    }
  }, [socket , userData]);  

  return (
    <div className='w-full min-h-screen bg-[#fff0e6] flex flex-col items-center gap-5 overflow-y-auto'>
      <Nav/>
      {/* header */}
      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center'>
        <div className='bg-white rounded-2xl shadow-md p-5 border border-orange-100 flex flex-col justify-start items-center hover:shadow-xl transition-shadow duration-300 w-[90%] text-center gap-2'>
          <h1 className='text-xl font-bold text-[#ff4d2d]'>Welcome, {userData?.fullname}</h1>
          <p className='text-[#ff4d2d]'>
            <span className='font-semibold'>Latitude</span>: {deliveryBoyLocation?.lat ?? userData?.location?.coordinates?.[1] ?? "—"},
            <span className='font-semibold'> Longitude</span>: {deliveryBoyLocation?.lon ?? userData?.location?.coordinates?.[0] ?? "—"}
          </p>
        </div>

      </div>
      {/* assignments || orders */}
       {!currentOrder &&      
        <div className='bg-white rounded-2xl p-5 shadow-md border border-orange-100'>
        <h2 className='text-lg font-bold mb-4 items-center flex gap-2'>Available Orders</h2>
       
        <div className='space-y-4'>
          {availableAssignments.length === 0 ? (<p className='text-gray-600'>No available orders at the moment.</p>
          ):
          availableAssignments.map((a , idx)=>(
            <div className='border rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center' key={idx}>
              <div className='flex flex-col gap-1'>
                <p className='font-semibold text-sm'>{a?.shopName}</p>
                <p className='text-gray-500 text-sm'><span className='font-semibold'>Delivery Address : </span>{a?.deliveryAddress?.text}</p>
                <p className='text-gray-400 text-xs'>{a.items.length} items | {a.subTotal}</p>
              </div>
              <button className='bg-orange-500 text-white px-4 py-2 rounded text-sm hover:bg-orange-600 w-full sm:w-auto' onClick={()=>acceptOrder(a.assignmentId)}>Accept</button>
            </div>
          ))}
        </div>
        </div>
       }

       {/* if Current Order available */}

       {currentOrder && 
       <div className='bg-white rounded-2xl p-5 shadow-md border border-orange-100 w-[90%] max-w-[600px]'> 
        <h2 className='text-lg font-bold mb-3'>📦 Current Order</h2>
        <div className='border rounded-lg p-4 mb-3'>
          <p className='font-semibold text-sm'>{currentOrder?.shopOrder.shop.name}</p>
          <p className='text-sm text-gray-500'>{currentOrder?.deliveryAddress.text}</p>
          <p className='text-xs text-gray-400'>{currentOrder?.shopOrder.shopOrderItems.length} items | {currentOrder?.shopOrder.subTotal }</p>
        </div>
        {(() => {
          const fallbackDeliveryBoyLocation = deliveryBoyLocation ?? (
            (userData?.location?.coordinates?.length >= 2)
              ? { lat: userData.location.coordinates[1], lon: userData.location.coordinates[0] }
              : null
          );

          const customerLocation = currentOrder?.deliveryAddress
            ? { lat: currentOrder.deliveryAddress.latitude, lon: currentOrder.deliveryAddress.longitude }
            : null;

          if (!fallbackDeliveryBoyLocation || !customerLocation) return null;

          return (
            <DeliveryBoyTracking
              data={{
                deliveryBoyLocation: fallbackDeliveryBoyLocation,
                customerLocation,
              }}
            />
          );
        })()} 
        {showOtpBox == false ? 
        <button className='mt-4 w-full bg-green-500 text-white font-semibold  px-4 py-2 rounded-xl shadow-md  hover:bg-green-600  active:scale-95 transition-all duration-200 ' onClick={sendOtp}>Mark as Delivered</button> 
        : 
        <div className='mt-4 p-5 border border-orange-100 rounded-2xl bg-white shadow-sm'>
          <p className='text-sm font-semibold mb-3 text-gray-800'>Enter OTP sent to <span className='text-orange-500'>{currentOrder.user.fullname}</span></p>
          <div className='flex flex-col gap-3'>
            <input
              type="text"
              placeholder='Enter 4-digit OTP'
              className='w-full border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-gray-50'
              onChange={(e)=>setOtp(e.target.value)}
              value={otp}
            />
            <button className='w-full bg-orange-500 text-white py-2.5 rounded-xl font-semibold hover:bg-orange-600 active:scale-[0.98] transition-all cursor-pointer' onClick={verifyOtp}>Submit OTP</button>
          </div>
        </div>
        }
        
       </div>
       }

 
    </div>
  )
}

export default DeliveryBoy