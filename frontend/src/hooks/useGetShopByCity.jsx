import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../redux/ownerSlice';
import { setShopsInMyCity } from '../redux/userSlice';

// function->useEffect(callback(function), <- calling this function)


function useGetShopByCity() {
  const dispatch = useDispatch();
  const { currentCity } = useSelector((state) => state.user);
 useEffect(() => {
  const fetchShops = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/shop/get-by-city/${currentCity}`,
        { withCredentials: true }
      );
      dispatch(setShopsInMyCity(result.data));
    } catch (error) {
      const status = error?.response?.status;
      if (status === 401 || status === 404) return;
    }
  };

  if (currentCity) {
    fetchShops();
  }
}, [currentCity]);

}

export default useGetShopByCity;