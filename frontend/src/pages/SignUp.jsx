import React, { useState } from "react";
import { FaRegEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app, auth } from "../../firebase";
import { ClipLoader } from "react-spinners";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function SignUp() {
  const primaryColor = "#7c3aed"; // blue-600
  const hoverColor = "#6d28d9"; // blue-700
  const bgColor = "#f2f7f5"; // slate-50
  const borderColor = "#ddd6fe"; // indigo-200

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSignUp = async function () {
    try {
      setLoading(true);
      const result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          fullname,
          email,
          password,
          mobile,
          role,
        },
        { withCredentials: true }
      );
      dispatch(setUserData(result.data?.user));
      setErr("");
      setLoading(false);
      navigate("/");
    } catch (error) {
      setErr(error?.response?.data?.message);
    }
  };

  const handleGoogleAuth = async function () {
    try {
      if (!mobile) {
        return setErr("Mobile no is required");
      }
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = await axios.post(
        `${serverUrl}/api/auth/google-auth`,
        {
          fullname: result.user.displayName,
          email: result.user.email,
          mobile,
          role,
        },
        { withCredentials: true }
      );
      setErr("");
      dispatch(setUserData(user.data?.user));
      setLoading(false);
      navigate("/");
    } catch (error) {
      setErr(error?.response?.data?.message);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(), handleSignUp();
      }}
    >
      <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-orange-100 via-orange-50 to-purple-50">
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl w-full max-w-md p-8 border border-orange-100">
          <h1
            className={`text-3xl font-bold mb-2 `}
            style={{ color: primaryColor }}
          >
            FoodieFly
          </h1>
          <p className="text-gray-600 mb-8">
            Hungry? Let Foodiefly bring your favorite meals to your door.
          </p>

          {/* {fullname} */}

          <div className="mb-4">
            <label
              htmlFor="fullName"
              className="block text-gray-700 font-medium mb-1"
            >
              Full Name
            </label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Enter Your Full Name"
              style={{ border: ` 1px solid ${borderColor}` }}
              onChange={(e) => setFullName(e.target.value)}
              value={fullname}
              required
            />
          </div>

          {/* {email} */}

          <div className="mb-4">
            <label
              htmlFor="fullName"
              className="block text-gray-700 font-medium mb-1"
            >
              Email
            </label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none"
              placeholder="Enter Your Email"
              style={{ border: ` 1px solid ${borderColor}` }}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              value={email}
              required
            />
          </div>

          {/* {mobile} */}

          <div className="mb-4">
            <label
              htmlFor="mobile"
              className="block text-gray-700 font-medium mb-1"
            >
              Mobile
            </label>
            <input
              type="tel"
              className="w-full rounded-lg px-3 py-2 focus:outline-none transition-colors duration-200"
              placeholder="Enter Your Mobile"
              style={{ border: ` 1px solid ${borderColor}` }}
              required
              onChange={(e) => {
                setMobile(e.target.value);
              }}
              value={mobile}
            />
          </div>

          {/* {password} */}

          <div className="mb-4">
            <label
              htmlFor="fullName"
              className="block text-gray-700 font-medium mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={`${showPassword ? "text" : "password"}`}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                placeholder="Enter Password"
                style={{ border: ` 1px solid ${borderColor}` }}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                value={password}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-500 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {!showPassword ? <FaRegEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>

          {/* {Role} */}

          <div className="mb-4">
            <label
              htmlFor="role"
              className="block text-gray-700 font-medium mb-1"
            >
              Role
            </label>
            <div className="flex gap-2">
              {["user", "owner", "deliveryBoy"].map((i) => (
                <button
                  type="button"
                  className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                  key={i}
                  onClick={() => {
                    setRole(i);
                  }}
                  style={
                    role == i
                      ? { backgroundColor: primaryColor, color: "white" }
                      : { border: `1px solid ${primaryColor}`, color: "#333" }
                  }
                >
                  {i}{" "}
                </button>
              ))}
            </div>
          </div>

          {/* signup button */}
          <button
            type="submit"
            className="w-full font-semibold border rounded-lg py-2 transition duration-200 cursor-pointer bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
            disabled={loading}
          > 
          {/* loading */}
          {loading? <ClipLoader size={20} />: "Sign Up"}
            
          </button>

         
          {/* displaying error */}
          {err && <p className="text-red-500 text-center">*{err}</p>}

          {/* google button */}
          <button
            type="button"
            className="w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 cursor-pointer border-gray-500 hover:bg-gray-200"
            onClick={() => {
              handleGoogleAuth();
            }}
          >
            <FcGoogle size={20} />
          </button>

          <p
            className="mt-2 text-center cursor-pointer"
            onClick={() => {
              navigate("/signin");
            }}
          >
            Already have an account ?
            <span className="mx-1.5   text-[#ff4d2d]">Sign In</span>
          </p>
        </div>
      </div>
    </form>
  );
}

export default SignUp;
