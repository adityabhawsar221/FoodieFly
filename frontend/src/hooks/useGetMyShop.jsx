import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../redux/ownerSlice';

// function->useEffect(callback(function), <- calling this function)


function useGetMyShop() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  useEffect(()=>{
        if (!userData || userData.role !== "owner") return;
        const fetchShop = async function() {
        try {
          const result = await axios.get(`${serverUrl}/api/shop/get-my`, {withCredentials:true});
          dispatch(setMyShopData(result.data));
        } catch (error) {
          const status = error?.response?.status;
          if (status === 401 || status === 404) return;
        }
    }
    fetchShop();
  },[userData])
}

export default useGetMyShop;