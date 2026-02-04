import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoSearchSharp } from "react-icons/io5";
import { BsCart3 } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { RxCrossCircled } from "react-icons/rx";
import { serverUrl } from "../App";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { FaPlus } from "react-icons/fa";
import { LuReceiptIndianRupee } from "react-icons/lu";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Nav() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData, currentCity, cartItems } = useSelector((state) => state.user);
  const { myShopData } = useSelector((state) => state.owner)
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const handleLogOut = async function () {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchItems = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`, { withCredentials: true });
      dispatch(setSearchItems(result.data));
    } catch (error) {
      console.error("Error searching items:", error);
    }
  }

  useEffect(() => {
    if(query){
      handleSearchItems();
    }else{
      dispatch(setSearchItems([]));
    }
    
  }, [query]);

  return (
    <div className="w-full h-20 flex items-center justify-between md:justify-center gap-8 px-5 fixed top-0 z-9999 bg-white/95 backdrop-blur-md border-b border-orange-100">
      {/* Show search button  */}
      {showSearch && userData.role == "user" && (
        <div className="md:hidden w-[90%] h-17.5 fixed top-20 left-[5%] bg-white shadow-xl rounded-lg  flex items-center gap-5">
          {/* location  */}
          <div className="flex items-center w-[30%] overflow-hidden gap-2.5 px-2.5 border-r-2 border-gray-400">
            <FaLocationDot
              size={25}
              className="w-6.25 h-6.25 text-[#ff4d2d]"
            />
            <div className="w-[80%] truncate text-gray-600 ">{currentCity || "Detecting..."}</div>
          </div>
          {/* search bar */}
          <div className="w-[80%] flex items-center gap-2.5">
            <IoSearchSharp size={25} className="text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="search delicious food..."
              className="text-gray-700 outline-0 w-full "
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}

      {/* Location and search bar */}

      <h1 className="text-3xl font-bold mb-2 text-[#ff4d2d]">FoodieFly</h1>
      {userData.role == "user" && (
        <div className="md:w-[60%] lg:w-[40%] h-17.5 bg-white shadow-md rounded-lg  hidden md:flex items-center gap-5">
          {/* location  */}
          <div className="flex items-center w-[30%] overflow-hidden gap-2.5 px-2.5 border-r-2 border-gray-400">
            <FaLocationDot
              size={25}
              className="w-6.25 h-6.25 text-[#ff4d2d]"
            />
            <div className="w-[80%] truncate text-gray-600 ">{currentCity || "Detecting..."}</div>
          </div>
          {/* search bar */}
          <div className="w-[80%] flex items-center gap-2.5">
            <IoSearchSharp size={25} className="text-[#ff4d2d]" />
            <input
              type="text"
              placeholder="search delicious food..."
              className="text-gray-700 outline-0 w-full "
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}

      {/* cart and profile buttons */}

      <div className="flex items-center gap-4">
        {/* if owner and if user */}

        {userData.role == "owner" ? (
          <>
            {myShopData && (<>
              <button className="hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d24]/10 text-[#ff4d2d]" onClick={() => navigate("/add-item")}>
                <FaPlus size={20} />
                <span>Add Food Item</span>
              </button>
              {/* plus */}
              <button className="md:hidden flex items-center gap-1 p-2 cursor-pointer rounded-full bg-[#ff4d24]/10 text-[#ff4d2d]" onClick={() => navigate("/add-item")}>
                <FaPlus size={20} />
              </button>
            </>)}

            {/* pending order for large divice*/}
            <div className="hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg  bg-[#ff4d24]/10 text-[#ff4d2d]" onClick={() => navigate("/my-orders")}>
              <LuReceiptIndianRupee size={20} />
              <span>My Orders</span>
              <span className="absolute -right-2 -top-2 text-xs font-bold text-white  bg-[#ff4d24] rounded-full px-1.5 py-px">0</span>
            </div>
            {/* pending order for large divice*/}
            <div className="md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg  bg-[#ff4d24]/10 text-[#ff4d2d]" onClick={() => navigate("/my-orders")}>
              <LuReceiptIndianRupee size={20} />
              <span className="absolute -right-2 -top-2 text-xs font-bold text-white  bg-[#ff4d24] rounded-full px-1.5 py-px">0</span>
            </div>
          </>

        ) : (
          <>
            {/* search icon for user */}

            {userData.role == "user" &&
              (showSearch ? (
                <RxCrossCircled
                  className="text-[#ff4d2d] md:hidden"
                  onClick={() => setShowSearch(false)}
                  size={35}
                />
              ) : (
                <IoSearchSharp
                  size={35}
                  className="text-[#ff4d2d] md:hidden"
                  onClick={() => setShowSearch(true)}
                />
              ))}

            {/* cart for user */}

            {userData.role == "user" && (
              <div className="relative cursor-pointer" onClick={() => navigate("/cart")}>
                <BsCart3 size={35} className="text-[#ff4d2d]" />
                <span className="absolute -right-2.25 -top-3 text-[#ff4d2d]">
                  {cartItems.length}
                </span>
              </div>
            )}

            {/* My Orders */}

            <button className="hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium cursor-pointer" onClick={() => navigate("/my-orders")}>
              My Orders
            </button>
          </>
        )}

        {/* profile */}

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer"
          onClick={() => setShowInfo((prev) => !prev)}
        >
          {userData?.fullname.slice(0, 1).toUpperCase()}
        </div>
        {/* pop up profile section */}
        {showInfo && (
          <div className={`fixed top-20 right-2.5 ${userData.role === 'deliveryBoy' ? 'md:right-[20%] lg:right-[40%]' : 'md:right-[10%] lg:right-[20%]'} w-45 bg-white shadow-2xl rounded-xl p-5 flex flex-col gap-2.5 z-9999`}>
            <div className="text-70px font-semibold">{userData.fullname}</div>
            {userData.role == "user" && <div className="md:hidden text-[#ff4d2d] font-semibold cursor-pointer" onClick={() => {
              navigate("/my-orders");
            }}>
              My Orders
            </div>}

            {userData.role == "deliveryBoy" && (
              <div
                className="text-black font-semibold cursor-pointer"
                onClick={() => {
                  setShowInfo(false);
                  navigate("/delivery-history");
                }}
              >
                My Deliveries
              </div>
            )}

            <div
              className="text-[#ff4d2d] font-semibold cursor-pointer"
              onClick={() => {
                handleLogOut();
              }}
            >
              logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
