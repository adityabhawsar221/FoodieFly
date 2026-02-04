import React, { useEffect, useRef, useState } from "react";
import Nav from "../pages/Nav";
import { categories } from "../category";
import CategoriesCard from "./CategoriesCard";
import { FaChevronCircleLeft } from "react-icons/fa";
import { FaChevronCircleRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import FoodCard from "./FoodCard";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";

// Button click
//    ↓
// scrollHandler()        <- called on button click
//    ↓
// Browser scroll         <-- browser handles the scroll
//    ↓
// scroll event fire      <-- scroll event is fired by the browser
//    ↓
// eventListener()       <-- our event listener handles the scroll event
//    ↓
// updateButton()        <-- updates button visibility based on scroll position
//    ↓
// setState()            <-- updates the state to show/hide buttons
//    ↓
// React re-render    <-- React re-renders the component with updated button visibility

function UserDashboard() {
  const cateScrollRef = useRef(null);
  const shopScrollRef = useRef(null);
  const navigate = useNavigate();
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(
    (state) => state.user,
  );

  const [leftButton, setLeftButton] = useState(false);
  const [rightButton, setRightButton] = useState(true);

  const [leftShopButton, setLeftShopButton] = useState(false);
  const [rightShopButton, setRightShopButton] = useState(false);

  const [updatedItemsList, setUpdatedItemsList] = useState(itemsInMyCity);

  const handleFilterByCategory = (category) => {
    if (category === "All") {
      setUpdatedItemsList(itemsInMyCity);
      return;
    } else {
      const filteredItems = itemsInMyCity?.filter(
        (item) => item.category === category,
      );
      setUpdatedItemsList(filteredItems);
    }
  };

  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity);
  }, [itemsInMyCity]);

  const updateButton = (ref, setLeft, setRight) => {
    const element = ref.current;
    if (!element) return;

    setLeft(element.scrollLeft > 0);
    setRight(element.clientWidth + element.scrollLeft < element.scrollWidth);
  };

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const cateEl = cateScrollRef.current;
    const shopEl = shopScrollRef.current;

    if (!cateEl || !shopEl) return;

    const handleCateScroll = () => {
      updateButton(cateScrollRef, setLeftButton, setRightButton);
    };

    const handleShopScroll = () => {
      updateButton(shopScrollRef, setLeftShopButton, setRightShopButton);
    };

    cateEl.addEventListener("scroll", handleCateScroll);
    shopEl.addEventListener("scroll", handleShopScroll);

    return () => {
      cateEl.removeEventListener("scroll", handleCateScroll);
      shopEl.removeEventListener("scroll", handleShopScroll);
    };
  }, []);

  return (
    <div className="w-screen min-h-screen bg-[#fff0e6] flex flex-col gap-5 overflow-y-auto items-center">
      <Nav />
      {
        searchItems && searchItems.length > 0 &&
        <div className=" w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4">
          <h1 className="text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2">Search Results</h1>
          <div className="w-full h-auto flex flex-wrap gap-6 justify-center">
            {searchItems.map((item, i) => (
              <FoodCard key={i} data={item} />
            ))}
          </div>
        </div>
      }
      {/* scrolling section */}
      {/* categories */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Inspiration for your first order
        </h1>
        <div className="w-full relative">
          {/* left scroll */}
          {leftButton && (
            <button className="absolute lg:-left-10 left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white rounded-full hover:bg-[#e64528]  p-2  shadow-lg z-10">
              <FaChevronCircleLeft
                size={20}
                className="cursor-pointer"
                onClick={() => {
                  scrollHandler(cateScrollRef, "left");
                }}
              />
            </button>
          )}
          {/* Categories */}
          <div
            className="w-full flex overflow-x-auto gap-4 pb-2 "
            ref={cateScrollRef}
          >
            {categories.map((cate, i) => (
              <CategoriesCard
                key={i}
                name={cate.category}
                image={cate.image}
                onClick={() => handleFilterByCategory(cate.category)}
              />
            ))}
          </div>
          {/* right scroll */}
          {rightButton && (
            <button
              className="absolute lg:-right-10 right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white rounded-full hover:bg-[#e64528]  p-2  shadow-lg z-10"
              onClick={() => {
                scrollHandler(cateScrollRef, "right");
              }}
            >
              <FaChevronCircleRight size={20} className=" cursor-pointer" />
            </button>
          )}
        </div>
      </div>
      {/* shops */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          Best restaurants in {currentCity || "your city"}
        </h1>
        <div className="w-full relative">
          {/* left scroll */}
          {leftShopButton && (
            <button className="absolute lg:-left-10 left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white rounded-full hover:bg-[#e64528]  p-2  shadow-lg z-10">
              <FaChevronCircleLeft
                size={20}
                className="cursor-pointer"
                onClick={() => {
                  scrollHandler(shopScrollRef, "left");
                }}
              />
            </button>
          )}
          {/* Categories */}
          <div
            className="w-full flex overflow-x-auto gap-4 pb-2 "
            ref={shopScrollRef}
          >
            {shopInMyCity?.map((shop, i) => (
              <CategoriesCard
                key={i}
                name={shop.name}
                image={shop.image}
                onClick={() => navigate(`/shop/${shop._id}`)}
              />
            ))}
          </div>
          {/* right scroll */}
          {rightShopButton && (
            <button
              className="absolute lg:-right-10 right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white rounded-full hover:bg-[#e64528]  p-2  shadow-lg z-10"
              onClick={() => {
                scrollHandler(shopScrollRef, "right");
              }}
            >
              <FaChevronCircleRight size={20} className=" cursor-pointer" />
            </button>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <h1 className="text-gray-800 text-2xl sm:text-3xl">Suggested food</h1>
        <div className="w-full h-auto flex flex-wrap gap-5 justify-center">
          {updatedItemsList?.map((item, i) => (
            <FoodCard key={i} data={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
