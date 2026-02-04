import React from "react";
import { useSelector } from "react-redux";
import UserDashboard from "../components/UserDashboard";
import OwnerDashboard from "../components/OwnerDashboard";
import DeliveryBoy from "../components/DeliveryBoy";
import Nav from "./Nav";

function Home() {
  const { userData } = useSelector((state) => state.user);
  return (
    <>
      
      <div className="w-full min-h-screen pt-24 flex flex-col items-center bg-[#fff0e6]">
        {userData.role == "user" && <UserDashboard></UserDashboard>}
        {userData.role == "owner" && <OwnerDashboard />}
        {userData.role == "deliveryBoy" && <DeliveryBoy />}
      </div>
    </>
  );
}

export default Home;
