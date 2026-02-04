import axios from 'axios'
import { setMyOrders } from '../redux/userSlice';
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'


function useGetMyOrders() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  useEffect(()=>{
        const fetchOrders = async function() {
        try {
          const result = await axios.get(`${serverUrl}/api/order/my-orders`, {withCredentials:true});
          dispatch(setMyOrders(result.data));
        } catch (error) {
          const status = error?.response?.status;
          if (status === 401 || status === 404) return;
          console.log("getting my orders error", error , status);
        }
    }
    fetchOrders();
  },[userData])
}

export default useGetMyOrders;