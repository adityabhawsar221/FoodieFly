import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App';
import { useParams } from 'react-router-dom';
import { FaStore } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";
import { FaUtensils } from "react-icons/fa6";
import FoodCard from '../components/FoodCard';
import { IoArrowBackSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';


function Shop() {
  const { shopId } = useParams()
  const navigate = useNavigate();
  const [items, setItems] = useState([])
  const [shop, setShop] = useState([])
  const handleShop = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`, { withCredentials: true });
      setItems(result.data.items);
      setShop(result.data.shop);
    } catch (error) {
      console.error("Error fetching shop data:", error);
    }
  }
  useEffect(() => {
    handleShop();
  }, [shopId])

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-100 via-orange-50 to-purple-50'>

      <button className='absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 shadow-lg transition px-3 py-2 cursor-pointer'  onClick={() => navigate(-1)}> 
        <IoArrowBackSharp size={30}/> Back
      </button>

      {shop &&
        <div className='relative w-full h-64 md:h-80 lg:h-96'>
          <img
            src={shop.image}
            alt={shop.name}
            className='w-full h-full object-cover'
          />
          <div className='absolute inset-0  bg-gradient-to-br from-black/70 to-black/50
            flex flex-col justify-center items-center text-center px-4'>
            <FaStore size={48} className='text-white mb-3 text-4xl drop-shadow-md' />
            <h1 className='text-3xl md:text-5xl lg:text-5xl font-extrabold text-white drop-shadow-lg'>{shop.name}</h1>
            <div className='flex items-center gap-[10px]'>
              <IoLocation size={20} className='text-white mt-3 mr-2 ' />
              <p className='text-gray-200 text-lg font-medium mt-3'>{shop.address}</p>
            </div>
          </div>
        </div>
      }
      <div className='max-w-7xl mx-auto px-6 py-10'>
        <h2 className='flex items-center justify-center gap-3 text-3xl font-bold text-gray-800 leading-normal'>
          <FaUtensils className="text-red-500 text-3xl shrink-0" />
          Menu
        </h2>

        {items.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8 justify-items-center'>
            {items.map((item) => (
              <FoodCard key={item._id || item.id} data={item} />
            ))}
          </div>
        ) : (
          <p className='text-center text-gray-500 text-lg mt-8'>No items available.</p>
        )}

      </div>

    </div>
  )
}

export default Shop