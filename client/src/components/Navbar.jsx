import React, { useContext, useState } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import { AppContext } from "./context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, setUserData, setIsLoggedIn, backend_url } = useContext(AppContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true

      const {data} = await axios.post(backend_url + "/api/auth/send-verify-otp")
      if(data.success){
        navigate('/email-verify')
        toast.success(data.message)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }}

  const logout = async () => {
    try {
      await axios.post(
        `${backend_url}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      setUserData(null);
      setIsLoggedIn(false);
      navigate("/");
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0">
      <img src={assets.logo} alt="#" className="w-28 sm:w-32" onClick={()=>navigate('/')} />
      {userData ? (
        <div className="relative">
          {/* Avatar */}
          <div
            className="flex justify-center items-center w-8 h-8 bg-gray-800 rounded-full text-white font-medium cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {userData?.name?.[0]?.toUpperCase()}
          </div>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md w-32 z-10">
              <ul className="list-none m-0 p-2 text-sm text-gray-700">
                {!userData.isAccountVerified && (
                  <li onClick={sendVerificationOtp} className="px-2 py-1 hover:bg-gray-100 cursor-pointer">
                    Verify Email
                  </li>
                )}
                <li
                  className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                  onClick={logout}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
        >
          Login <img src={assets.arrow_icon} alt="#" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
