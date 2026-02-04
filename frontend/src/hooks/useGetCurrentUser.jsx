import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice';

// function->useEffect(callback(function), <- calling this function)


function useGetCurrentUser() {
  const dispatch = useDispatch();
  useEffect(()=>{
        const fetchUser = async function() {
        try {
          const result = await axios.get(`${serverUrl}/api/user/current`, {withCredentials:true});
          dispatch(setUserData(result.data));
        } catch (error) {
          const status = error?.response?.status;
          // Not logged in yet (expected on first load)
          if (status === 401 || status === 400) return;
        }
    }
    fetchUser();
  },[])
}

export default useGetCurrentUser;