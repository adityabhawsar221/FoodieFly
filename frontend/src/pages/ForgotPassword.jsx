import axios from "axios";
import React, { useState } from "react";
import { IoArrowBackSharp } from "react-icons/io5";
import { Navigate, useNavigate } from "react-router-dom";
import { serverUrl } from "../App";
import { ClipLoader } from "react-spinners";
function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err , setErr] = useState("")
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async function () {
    try {
      setLoading(true);
      const result = await axios.post(
        `${serverUrl}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      console.log(result)
      setStep(2);
      setErr("");
    } catch (error) {
      setErr(error?.response?.data?.message);
    } finally{
      setLoading(false);
    }
  };

  const handleVerifyOtp = async function () {
    try {
      setLoading(true);
      const result = await axios.post(
        `${serverUrl}/api/auth/verify-otp`,
        { otp , email},
        { withCredentials: true }
      );
      console.log(result)
      setStep(3);
      setErr("");
    } catch (error) {
       setErr(error?.response?.data?.message);
    }finally{
      setLoading(false);
    }
  };

  const handleResetPassword = async function () {
    if(newPassword != confirmPassword) {
      setErr("Passwords do not match");
      return;
    }
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email , newPassword},
        { withCredentials: true }
      );
      setErr("");
      navigate("/signin")
    } catch (error) {
         setErr(error?.response?.data?.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-orange-100 via-orange-50 to-purple-50">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl w-full max-w-md p-8 border border-orange-100">
        {/* heading part */}
        <div className="flex items-center  gap-4 mb-4">
          <IoArrowBackSharp
            size={30}
            className="text-2xl text-[#7c3aed] cursor-pointer"
            onClick={() => navigate("/signin")}
          />
          <h1 className="text-2xl font-bold text-center text-[#7c3aed]">
            Forgot Password
          </h1>
        </div>
        {/* steps section */}
        {step == 1 && (
          <div>
            <div className="mb-6 mt-6">
              <label
                htmlFor="Email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email Address
              </label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Enter your registered email address"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                value={email}
              />
            </div>

            <button
              className={`w-full mb-2 font-semibold  border rounded-lg py-2 transition duration-200 cursor-pointer bg-[#7c3aed] text-white hover:bg-[#6d28d9]`}
              onClick={()=>{handleSendOtp()}}
               disabled={loading}
            >
              {loading ? <ClipLoader size={20} color="#ffffff"></ClipLoader> :"SEND OTP" }
            </button>
             {/* displaying error */}
          {err && <p className="text-red-500 text-center">*{err}</p>}

            <p className="mt-2 font-light">
              We’ll send a one-time password (OTP) to your email for
              verification.
            </p>
          </div>
        )}

        {step == 2 && (
          <div>
            <div className="mb-6 mt-2">
              <label
                htmlFor="otp"
                className="block text-gray-700 font-medium mb-1"
              >
                One-Time Password (OTP)
              </label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Enter the OTP sent to your email"
                onChange={(e) => {
                  setOtp(e.target.value);
                }}
                value={otp}
              />
            </div>

            <button
              className={`w-full font-semibold  border rounded-lg py-2 transition duration-200 cursor-pointer bg-[#7c3aed] text-white hover:bg-[#6d28d9]`}
              onClick={()=>{handleVerifyOtp()}}
               disabled={loading}
            >
              
              {loading ? <ClipLoader size={20} color="#ffffff"></ClipLoader> :"VERIFY OTP" }
            </button>
             {/* displaying error */}
          {err && <p className="text-red-500 text-center">*{err}</p>}
          </div>
        )}

        {step == 3 && (
          <div>
            {/* new passwoed */}
            <div className="mb-6 mt-2">
              <label
                htmlFor="newPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                New Password
              </label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Enter your new password"
                onChange={(e) => {
                  setNewPassword(e.target.value);
                }}
                value={newPassword}
              />
            </div>
            {/* confirm password */}
            <div className="mb-6 mt-2">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-1"
              >
                Confirm New Password
              </label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Re-enter your new password"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
                value={confirmPassword}
              />
            </div>

            <button
              className={`w-full font-semibold  border rounded-lg py-2 transition duration-200 cursor-pointer bg-[#7c3aed] text-white hover:bg-[#6d28d9]`}
              onClick={()=>{handleResetPassword()}}
              disabled={loading}
            >
               {loading ? <ClipLoader size={20} color="#ffffff"></ClipLoader> :"UPDATE PASSWORD" }
            </button>
              {/* displaying error */}
          {err && <p className="text-red-500 text-center">*{err}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
