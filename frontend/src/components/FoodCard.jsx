import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { CiStar } from "react-icons/ci";
import { FaMinus } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { FaShoppingCart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/userSlice";

function FoodCard({ data }) {
  const [quantity, setQuantity] = useState(0);
  const dispatch = useDispatch();
  const {cartItems} = useSelector(state=>state.user);
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-500 text-lg" />);
      } else {
        stars.push(<CiStar key={i} className="text-yellow-500 text-lg" />);
      }
    }
    return stars;
  };
  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };
  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };
  return (
    <div className=" w-[300px]  rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* image part */}
      <div className="relative w-full h-[170px] flex justify-center items-center bg-white ">
        {data.foodType === "veg" ? (
          <div className="absolute top-2 left-2 z-10 w-5 h-5 border-2 border-green-600 bg-white  flex justify-center items-center">
            <div className="w-3 h-3 bg-green-600"></div>
          </div>
        ) : (
          <div className="absolute top-2 left-2 z-10 w-5 h-5 border-2 border-red-600 bg-white  flex justify-center items-center">
            <div className="w-3 h-3 bg-red-600 "></div>
          </div>
        )}

        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer z-0"
        />
      </div>
      {/* details part */}
      <div className="flex-1 flex flex-col p-4">
        <h1 className="font-semibold text-gray-900 text-base truncate">
          {data.name}
        </h1>
        {/* rating */}
        <div className="flex items-center mt-1 gap-1">
          {renderStars(data.rating?.average || 0)}
          <span className="text-gray-600 ">({data.rating?.count || 0})</span>
        </div>
      </div>
      {/* price and cart */}
      <div className="flex items-center justify-between mt-auto p-3">
        <span className="font-bold text-gray-950 text-lg">₹ {data.price}/-</span>
        <div className="flex items-center border rounded-full overflow-hidden shadow-sm">
          {/* minus */}
          <button
            onClick={handleDecrement}
            className="px-2 py-1 hover:bg-gray-100 transition cursor-pointer"
          >
            <FaMinus size={12} />
          </button>
          {/* quantity */}
          <span>{quantity}</span>
          {/* plus */}
          <button
            onClick={handleIncrement}
            className="px-2 py-1 hover:bg-gray-100 transition cursor-pointer"
          >
            <FaPlus size={12} />
          </button>
          {/* cart */}
          <button
            className={`${cartItems.some(i=>i.id == data._id) ? "bg-gray-800" : "bg-[#ff4d2d]"} text-white px-3 py-2 transition-colors cursor-pointer`}
            onClick={() => {
              if(quantity > 0) {dispatch(
                addToCart({
                  id: data._id,
                  name: data.name,
                  price: data.price,
                  image: data.image,
                  shop: data.shop,
                  quantity,
                  foodType: data.foodType,
                })
              )};
              setQuantity(0);
            }}
          >
            <FaShoppingCart size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodCard;
