import React, { useEffect, useState } from "react";
import { IoArrowBackSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { CiMobile3 } from "react-icons/ci";
import { FaLocationDot } from "react-icons/fa6";
import { IoSearchSharp } from "react-icons/io5";
import { BiCurrentLocation } from "react-icons/bi";
import { BsCreditCard2Front } from "react-icons/bs";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import "leaflet/dist/leaflet.css";
import { MdDeliveryDining } from "react-icons/md";
import { setAddress, setLocation } from "../redux/mapSlice";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import { serverUrl } from "../App";
import { addMyOrders, clearCart } from "../redux/userSlice";

function RecenterMap({ location }) {
  if (!location.lat || !location.lon) return null;
  const map = useMap();
  map.setView([location.lat, location.lon], 16, { animate: true });
  return null;
}

function CheckOut() {
  const [loading, setLoading] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const { location, address } = useSelector((state) => state.map);
  const { cartItems, totalAmount } = useSelector((state) => state.user);
  const deliveryFee = (totalAmount >= 500) ? 0 : 40;
  const finalAmount = totalAmount + deliveryFee;


  const onDragEnd = (e) => {
    const lat = e.target.getLatLng().lat;
    const lon = e.target.getLatLng().lng;
    dispatch(setLocation({ lat, lon }));
    getAddressByLatLng(lat, lon);
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        dispatch(setLocation({ lat: latitude, lon: longitude }));
        getAddressByLatLng(latitude, longitude);
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getAddressByLatLng = async (lat, lon) => {
    try {
      const apiKey = import.meta.env.VITE_GEOAPIFY_APIKEY;
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${apiKey}`,
      );
      setAddressInput(
        result.data.results[0].formatted ||
        result.data.results[0].address_line1 ||
        result.data.results[0].address_line2 ||
        "",
      );
      dispatch(setAddress(addressInput));
    } catch (e) {
      console.log(e);
    }
  };

  const getLatLngByAddress = async (address) => {
    try {
      const result = await axios.get(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${import.meta.env.VITE_GEOAPIFY_APIKEY}`,
      );
      const { lat, lon } = result.data.features[0].properties;
      dispatch(setLocation({ lat, lon }));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setAddressInput(address);
  }, [address]);


  const handlePlaceOrder = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/place-order`,
        {
          paymentMethod,
          deliveryAddress: {
            text:addressInput,
            latitude:location.lat,
            longitude:location.lon,
          },
          totalAmount:finalAmount,
          cartItems,
        },
        {
          withCredentials: true,
        }
      );

      if(paymentMethod === "cod"){
        dispatch(addMyOrders(result.data.newOrder));
        dispatch(clearCart());
        navigate("/order-placed");
      }else{
        const orderId = result.data.orderId;
        const razorOrder = result.data.razorOrder;
        openRazorpayWindow(razorOrder, orderId);
      }

      
    } catch (error) {
      console.log("Place order error:", error);
    }
  }

  const openRazorpayWindow = (razorOrder, orderId) => {
    const options = {
      key:import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount:razorOrder.amount,
      currency:"INR",
      name:"FoodieFly",
      description:"Food Payment",
      order_id:razorOrder.id,
      handler: async function(response){
        try {
          const result = await axios.post(`${serverUrl}/api/order/verify-payment`,{ razorpay_payment_id: response.razorpay_payment_id,
          orderId,
        }, { withCredentials:true });
          dispatch(addMyOrders(result.data));
          dispatch(clearCart());
          navigate("/order-placed");
        } catch (error) {
          console.log("Payment verification failed:", error);
        }
      }
    }
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#fff0e6] p-6">
      {/* back button */}
      <div className="absolute top-6 left-6 flex z-10">
        <IoArrowBackSharp
          size={35}
          className=" text-[#ff4d2d] cursor-pointer"
          onClick={() => navigate("/cart")}
        />
      </div>

      <div className="w-full max-w-225 bg-white p-6 rounded-2xl shadow-xl space-y-6">
        {/* heading */}
        <h1 className="text-2xl font-bold text-gray-800">Checkout</h1>
        {/* location section */}
        <section>
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800">
            <FaLocationDot className="text-[#ff4d2d]" />
            Delivery Location
          </h2>
          {/* location search bar*/}
          <div className="flex gap-2 mb-3!">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d]"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter Your Delivery Address"
            />
            <button
              className="bg-[#ff4d2d] hover:bg-[#e64526] text-white rounded-lg py-2 px-3 flex items-center justify-center"
              onClick={() => getLatLngByAddress(addressInput)}
            >
              <IoSearchSharp size={25} />
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 px-3 flex items-center justify-center"
              onClick={getCurrentLocation}
            >
              {loading ? (
                <ClipLoader size={20} color="#ffffff" />
              ) : (
                <BiCurrentLocation size={25} />
              )}
            </button>
          </div>
          {/* map part*/}
          <div className="rounded-xl border overflow-hidden">
            {/* map */}
            <div className="w-full h-64 flex items-center justify-center">
              <MapContainer
                className="w-full h-full"
                center={[location.lat, location.lon]}
                zoom={103}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap location={location} />
                <Marker
                  position={[location.lat, location.lon]}
                  draggable
                  eventHandlers={{ dragend: onDragEnd }}
                ></Marker>
              </MapContainer>
            </div>
          </div>
        </section>

        {/* [payment section] */}

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            Payment Method
          </h2>
          {/* cod & online */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* cod */}
            <div
              className={`flex items-center rounded-xl gap-3 p-4 text-left transition border cursor-pointer ${paymentMethod === "cod" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"} `}
              onClick={() => setPaymentMethod("cod")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-200 ">
                <MdDeliveryDining className="text-green-600 text-xl" />
              </span>
              <div>
                <p className="text-gray-800 font-medium">Cash on Delivery</p>
                <p className="text-gray-500 text-xs">Pay when your order arrives</p>
              </div>
            </div>
            {/* online */}
            <div
              className={`flex items-center rounded-xl gap-3 p-4 text-left transition border cursor-pointer ${paymentMethod === "online" ? "border-[#ff4d2d] bg-orange-50 shadow" : "border-gray-200 hover:border-gray-300"} `}
              onClick={() => setPaymentMethod("online")}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 "><CiMobile3 size={22} className="text-purple-700 text-xl" /></span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 "><BsCreditCard2Front size={22} className="text-blue-700 text-lg" /></span>
              <div>
                <p className="text-gray-800 font-medium">UPI / Credit / Debit Cards</p>
                <p className="text-gray-500 text-xs">Pay securely using your preferred method</p>
              </div>
            </div>
          </div>
        </section>

        {/* Order Summary */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Order Summary</h2>
          <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
            {cartItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm text-gray-700" >
                <span>{item.name} x {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}

            <hr className="border-gray-300 my-2" />

              <div className="flex justify-between font-medium text-gray-800">
                <span>Subtotal:</span>
                <span>₹{totalAmount}</span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-700">
                <span>Delivery : </span>
                <span>₹{deliveryFee === 0 ? "Free" : deliveryFee}</span>
              </div>

            
              <div className="flex justify-between font-bold text-lg text-[#ff4d2d] pt-2">
                <span>Total:</span>
                <span>₹{finalAmount}</span>
              </div>


          </div>
        </section>

        {/* payment button */}
        <button className="w-full bg-[#ff4d2d] hover:bg-[#e64526] text-white py-3 rounded-xl font-semibold cursor-pointer" onClick={handlePlaceOrder}>
           {paymentMethod === "cod" ? "Place Order" :   `Pay ₹${finalAmount} & Place Order `}
        </button>
      </div>
    </div>
  );
}

export default CheckOut;
