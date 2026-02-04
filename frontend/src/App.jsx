import React from 'react'
import { Routes , Route, Navigate} from 'react-router-dom'
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import CreateEditShop from './pages/CreateEditShop';
import useGetCurrentUser from './hooks/useGetCurrentUser';
import { useDispatch, useSelector } from 'react-redux';
import useGetCity from './hooks/useGetCity';
import useGetMyShop from './hooks/useGetMyShop';
import CartPage from './pages/CartPage';
import AddItem from './pages/AddItem';
import EditItem from './pages/EditItem';
import CheckOut from './pages/CheckOut';
import useGetShopByCity from './hooks/useGetShopByCity';
import useGetItemByCity from './hooks/useGetItemByCity';
import OrderPlaced from './pages/OrderPlaced';
import MyOrders from './pages/MyOrders';
import useGetMyOrders from './hooks/useGetMyOrders';
import useUpdateLocation from './hooks/useUpdateLocation';
export const serverUrl = "http://localhost:3000"
import TrackOrderPage from './pages/TrackOrderPage';
import Shop from './pages/Shop';
import DeliveryHistory from './pages/DeliveryHistory';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { setSocket } from './redux/userSlice';

// Keep a single socket instance in dev (prevents duplicate connects in StrictMode/HMR)
const getSocketInstance = (() => {
  let socket;
  return (url) => {
    if (!socket) socket = io(url, { withCredentials: true });
    return socket;
  };
})();

const App = () => {
  const dispatch = useDispatch();
  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useUpdateLocation();
  useGetShopByCity();
  useGetItemByCity();
  useGetMyOrders();

  const {userData} = useSelector(state=>state.user);

  useEffect(() => { // initialize socket connection once
    const socketInstance = getSocketInstance(serverUrl);
    dispatch(setSocket(socketInstance));
  }, [dispatch]);

  useEffect(() => { // emit identity whenever userId becomes available
    if (!userData?._id) return;
    const socketInstance = getSocketInstance(serverUrl);

    const sendIdentity = () => socketInstance.emit("identity", { userId: userData._id });
    if (socketInstance.connected) {
      sendIdentity();
      return;
    }

    socketInstance.once("connect", sendIdentity);
    return () => socketInstance.off("connect", sendIdentity);
  }, [userData?._id]);

  return (
    <Routes>
      <Route path='/' element ={userData?<Home/>:<Navigate to={"/signin"}></Navigate>}/>
      <Route path='/signin' element ={!userData?<SignIn/> : <Navigate to={"/"}/>}/>
      <Route path='/signup' element ={!userData?<SignUp/> : <Navigate to={"/"}/>}/>
      <Route path='/forgot-password' element={!userData?<ForgotPassword/> : <Navigate to={"/"}/>}/>
      <Route path='/create-edit-shop' element ={userData?<CreateEditShop/> : <Navigate to={"/signin"}/>}/>
      <Route path='/add-item' element={userData ? <AddItem /> : <Navigate to={"/signin"} />} />
      <Route path='/edit-item/:itemId' element={userData ? <EditItem /> : <Navigate to={"/signin"} />} />
      <Route path='/cart' element={userData ? <CartPage /> : <Navigate to={"/signin"} />} />
      <Route path='/checkout' element={userData ? <CheckOut /> : <Navigate to={"/signin"} />} />
      <Route path='/order-placed' element={userData ? <OrderPlaced /> : <Navigate to={"/signin"} />} />
      <Route path='/my-orders' element={userData ? <MyOrders /> : <Navigate to={"/signin"} />} />
      <Route path='/track-order/:orderId' element={userData ? <TrackOrderPage /> : <Navigate to={"/signin"} />} />
      <Route path='/shop/:shopId' element={userData ? <Shop /> : <Navigate to={"/signin"} />} />
      <Route path='/delivery-history' element={userData?.role === 'deliveryBoy' ? <DeliveryHistory /> : <Navigate to={'/'} />} />
    </Routes>

  )
}

export default App;