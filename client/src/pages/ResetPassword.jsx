import React, { useState, useRef } from "react";
import { assets } from "../assets/assets.js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [otp, setOtp] = useState("");
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const backend_url = import.meta.env.VITE_BACKEND_URL;

  // Handle auto-focus when typing OTP
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace in OTP
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle pasting full OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();
    if (/^\d+$/.test(paste)) {
      paste.split("").forEach((char, i) => {
        if (i < inputRefs.current.length) {
          inputRefs.current[i].value = char;
        }
      });
    }
  };

  // Step 1: send reset OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backend_url}/api/auth/send-reset-otp`, { email });
      if (data.success) {
        toast.success(data.message);
        setStep(2);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Step 2: verify OTP (just go to next step, actual check happens on password reset)
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const enteredOtp = inputRefs.current.map((ref) => ref.value).join("");
    if (enteredOtp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }
    setOtp(enteredOtp);
    setStep(3);
  };

  // Step 3: reset password
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backend_url}/api/auth/reset-password`, {
        email,
        otp,
        newPassword: password,
      });

      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-400 to-purple-400">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="#"
        className="w-28 sm:w-32 cursor-pointer absolute top-5 left-5"
      />

      {/* Step 1: Email Form */}
      {step === 1 && (
        <form
          onSubmit={handleEmailSubmit}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm text-white"
        >
          <h1 className="text-center text-2xl mb-4">Reset Password</h1>
          <p className="text-gray-200 text-center mb-6">
            Enter your registered email address
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.mail_icon} alt="" className="w-3 h-3" />
            <input
              type="email"
              placeholder="Email id"
              className="bg-transparent outline-none text-white flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3">
            Submit
          </button>
        </form>
      )}

      {/* Step 2: OTP Form */}
      {step === 2 && (
        <form
          onSubmit={handleOtpSubmit}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm text-white"
        >
          <h1 className="text-center text-2xl mb-4">Reset Password OTP</h1>
          <p className="text-gray-200 text-center mb-6">
            Enter the 6-digit code sent to your email id
          </p>
          <div className="flex justify-between mb-8" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  type="text"
                  maxLength="1"
                  key={index}
                  className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
                  required
                />
              ))}
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full">
            Verify Email
          </button>
        </form>
      )}

      {/* Step 3: New Password Form */}
      {step === 3 && (
        <form
          onSubmit={handlePasswordSubmit}
          className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm text-white"
        >
          <h1 className="text-center text-2xl mb-4">New Password</h1>
          <p className="text-gray-200 text-center mb-6">
            Enter your new password below
          </p>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
            <img src={assets.lock_icon} alt="" className="w-3 h-3" />
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent outline-none text-white flex-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer">
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
