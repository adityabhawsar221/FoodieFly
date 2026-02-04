import { IoMdArrowRoundBack } from "react-icons/io";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { GiForkKnifeSpoon } from "react-icons/gi";
import { useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { setMyShopData } from "../redux/ownerSlice";
import { ClipLoader } from "react-spinners";

function AddItem() {
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const category = [
    "Snacks",
    "Main Course",
    "Desserts",
    "Pizza",
    "Burger",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",
  ];
  const [selectedCategory, setSelectedCategory] = useState(category[0]);
  const [foodType, setFoodType] = useState("veg");
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);

  const handleImage = async function (e) {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSubmit = async function (e) {
    setLoading(true);
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("category", selectedCategory);
      formData.append("name", name);
      formData.append("price" , price);
      formData.append("foodType" , foodType);
      if(backendImage) {
        formData.append("image", backendImage);
      }
      const result = await axios.post(`${serverUrl}/api/item/add-item`, formData, {
        withCredentials: true,
      });
      dispatch(setMyShopData(result.data));
      console.log(result.data);
      navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className=" min-h-screen flex flex-col items-center justify-center p-6 relative bg-gradient-to-br from-orange-100 to-white w-full ">
      <div
        className="absolute top-[20px] left-[20px] cursor-pointer z-[10] mb-[10px]"
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
            Add New Item
          </div>
        </div>
        {/* form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* name */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter item name"
              className=" w-full 
            px-4 py-2 border rounded-lg  focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
          {/* image */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Food Image
            </label>
            <input
              type="file"
              accept="image/*"
              placeholder="Enter shop name"
              className=" w-full 
            px-4 py-2 border rounded-lg  focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={handleImage}
            />
            {frontendImage && (
              <div className="mt-4">
                <img
                  src={frontendImage}
                  alt=""
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
          {/* price */}

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              placeholder="0"
              className=" w-full 
            px-4 py-2 border rounded-lg  focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
            />
          </div>

          {/* category */}

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Select Category
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg  focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setSelectedCategory(e.target.value)}
              value={selectedCategory}
            >
              <option value="">Select Category</option>
              {category.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* food type */}
          
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Select Food Type
            </label>
            <select
              className="w-full px-4 py-2 border rounded-lg  focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e) => setFoodType(e.target.value)}
              value={foodType}
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>

            </select>
          </div>

          {/* Save */}
          <button className="w-full bg-[#ff4f2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer " disabled={loading}>
            {loading ? <ClipLoader size={20} color="#ffffff" /> : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddItem;
