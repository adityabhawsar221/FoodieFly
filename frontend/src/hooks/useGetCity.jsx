import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentCity, setCurrentState , setCurrentAddress } from '../redux/userSlice';
import { setAddress, setLocation } from '../redux/mapSlice';



function useGetCity() {
  const dispatch = useDispatch();
  const apiKey = import.meta.env.VITE_GEOAPIFY_APIKEY;
  const userData = useSelector(state=>state.user);

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(async function(position){
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude; 
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`)

      const city =
        result.data.results[0].city ||
        result.data.results[0].town ||
        result.data.results[0].district;

      const state = result.data.results[0].state || "";

      dispatch(setLocation({lat:latitude , lon:longitude}));
      dispatch(setAddress(result.data.results[0].formatted || result.data.results[0].address_line1 || result.data.results[0].address_line2 || ""));
      dispatch(setCurrentCity(city))
      dispatch(setCurrentState(state));
      dispatch(setCurrentAddress(result.data.results[0].formatted || result.data.results[0].address_line1 || result.data.results[0].address_line2 || ""));
    })
  },[userData])
}

export default useGetCity;