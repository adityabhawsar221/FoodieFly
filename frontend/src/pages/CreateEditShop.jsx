import React, { useRef } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { Form, useNavigate } from "react-router-dom";

import { GiForkKnifeSpoon } from "react-icons/gi";
import { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";

function CreateEditShop() {
  const dispatch = useDispatch()
  const navigate = useNavigate(); 
  const {myShopData} = useSelector((state) => state.owner);
  const {  currentCity, currentState, currentAddress } = useSelector((state) => state.user);
  const [name , setName] = useState(myShopData?.name || "");
  const [address , setAddress] = useState(myShopData?.address || currentAddress || "");
  const [city , setCity] = useState(myShopData?.city || currentCity || "");
  const [state , setState] = useState(myShopData?.state || currentState || "");
  const [frontendImage , setFrontendImage] = useState(myShopData?.image || null);
  const [backendImage , setBackendImage] = useState(null);

  const handleImage = async function(e){
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  }

  const handleSubmit = async function(e){
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name" , name);
      formData.append("address" , address);
      formData.append("city" , city);
      formData.append("state" , state);
      if(backendImage){
        formData.append("image" , backendImage);
      }
      const result = await axios.post(`${serverUrl}/api/shop/create-edit`, formData , { withCredentials: true });
      dispatch(setMyShopData(result.data));
      navigate("/");
    } catch (error) {
      console.log(error); 
    }
  }
  return (
    <div className=" min-h-screen flex flex-col items-center justify-center p-6 relative bg-gradient-to-br from-orange-100 to-white w-full ">
      <div
        className="absolute top-5 left-5 cursor-pointer z-10 mb-2.5"
        onClick={() => {
          navigate("/");
        }}
      >
        <IoMdArrowRoundBack size={35} className="text-[#ff4d2d]" />
      </div>
      {/* creating form */}
      <div className=" max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
        {/* box styling */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <GiForkKnifeSpoon className="text-[#ff4d2d] w-16 h-16" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {myShopData? "edit your shop" : "create your shop"}
          </div>
        </div>
        {/* form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* name */}
          <div >
            <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
            <input type="text" placeholder="Enter shop name" className=" w-full 
            px-4 py-2 border rounded-lg  focus:outline-none focus:ring-2 focus:ring-orange-500" onChange={(e)=>setName(e.target.value)} value={name}/>
          </div>
          {/* image */}
           <div >
            <label className="block mb-1 text-sm font-medium text-gray-700">Shop Image</label>
            <input type="file" accept="image/*" placeholder="Enter shop name" className=" w-full 
            px-4 py-2 border rounded-lg  focus:outline-none focus:ring-2 focus:ring-orange-500"  onChange={handleImage} />
            {frontendImage &&<div className="mt-4">
              <img src={frontendImage} alt="" className="w-full h-48 object-cover rounded-lg border" />
            </div>}
          </div>
          {/* State & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* state */}
            <div><label className="block mb-1 text-sm font-medium text-gray-700">State</label>
            <input type="text" placeholder="Enter shop state" className=" w-full 
            px-4 py-2 border rounded-lg  focus:outline-none focus:ring-2 focus:ring-orange-500" onChange={(e)=>setState(e.target.value)} value={state}/>
            </div> 
            {/* city */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">City</label>
            <input type="text" placeholder="Enter city" className=" w-full 
            px-4 py-2 border rounded-lg  focus:outline-none focus:ring-2 focus:ring-orange-500" onChange={(e)=>setCity(e.target.value)} value={city}/>
            </div>
          </div>
          {/* address */}
          <div >
            <label className="block mb-1 text-sm font-medium text-gray-700">Address</label>
            <input type="text" placeholder="Enter shop address" className=" w-full 
            px-4 py-2 border rounded-lg  focus:outline-none focus:ring-2 focus:ring-orange-500" onChange={(e)=>setAddress(e.target.value)} value={address} />
          </div>
          {/* Save */}
          <button className="w-full bg-[#ff4f2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer ">Save</button>
        </form>
      </div>
    </div>
  );
}

export default CreateEditShop;
