import React from "react";
import Nav from "../pages/Nav";
import { useSelector } from "react-redux";
import { GiForkKnifeSpoon } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { FaPen } from "react-icons/fa";
import OwnerItemCard from "./OwnerItemCard";

function OwnerDashboard() {
  const navigate = useNavigate();
  const { myShopData } = useSelector((state) => state.owner);
  return (
    
    <div className="w-full min-h-screen bg-[#fff0e6] flex flex-col items-center gap-5 overflow-y-auto">
      <Nav> </Nav>
      {/* if no shop then this card will show */}
      {!myShopData && (
        <div className="flex justify-center items-center p-4 sm:p-6">
          <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
              <GiForkKnifeSpoon className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Add Your Shop
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Join our food delivery platform and start reaching more
                customers today!
              </p>
              <button
                className="bg-[#ff4d2d] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-[#e04324] font-medium shadow-md   transition-colors duration-300"
                onClick={() => navigate("/create-edit-shop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* if shop is there then dashboard will show */}
      {myShopData && (
        <div className="w-full flex flex-col px-4 gap-6 items-center ">
          <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center">
            <GiForkKnifeSpoon className="text-[#ff4d2d] w-12 h-12 sm:w-18 sm:h-18 mb-4" />
            Welcome to {myShopData.name}
          </h1>
          {/*  shop  image  & details */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden w-full max-w-3xl border border-orange-100 hover:shadow-xl transition-all duration-300 relative">
            <div
              className="w-full h-48 sm:h-64 bg-center bg-contain bg-no-repeat bg-gray-100"
              style={{ backgroundImage: `url(${myShopData.image})` }}
              aria-label={myShopData.name}
              role="img"
            />

            {/* shop details */}
            <div
              className="absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full cursor-pointer hover:bg-orange-600 transition-colors"
              onClick={() => navigate("/create-edit-shop")}
            >
              <FaPen size={25} />
            </div>
            <div className="p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                {myShopData.name}
              </h1>
              <p className="text-gray-500 ">
                {myShopData.city} , {myShopData.state}
              </p>
              <p className="text-gray-500 mb-4">{myShopData.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* items */}

      {myShopData?.items?.length === 0 && (
        <>
          {/* if no shop have no items then this card will show */}
          <div className="flex justify-center items-center p-4 sm:p-6">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col items-center text-center">
                <GiForkKnifeSpoon className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  Add Your Food Items
                </h2>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Start adding delicious food items to your shop and attract
                  more customers!
                </p>
                <button
                  className="bg-[#ff4d2d] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-[#e04324] font-medium shadow-md   transition-colors duration-300"
                  onClick={() => navigate("/add-item")}
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* items card */}

      {myShopData?.items?.length > 0 && (
           <div className="flex flex-col items-center w-full gap-4 max-w-3xl mt-6 mb-10 px-6 sm:px-0">
            {myShopData.items.map((item, index) => (
            <OwnerItemCard key={index} data={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;
