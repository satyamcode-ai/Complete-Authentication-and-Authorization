import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../components/context/AppContext'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect } from 'react'

const EmailVerify = () => {

  axios.defaults.withCredentials = true

  const {backend_url,isLoggedIn,userData,getUserData} = useContext(AppContext)

  const navigate = useNavigate()

  const inputRefs = React.useRef([])

  const handleInput = (e,index)=>{
    if(e.target.value.length > 0 && index < inputRefs.current.length - 1){
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e,index)=>{
    if(e.key === 'Backspace' && e.target.value === '' && index > 0){
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
  e.preventDefault(); // prevent default paste behavior
  const paste = e.clipboardData.getData("text").trim();

  // Only take as many characters as inputs available
  const chars = paste.split("").slice(0, inputRefs.current.length);

  chars.forEach((char, index) => {
    const input = inputRefs.current[index];
    if (input) {
      input.value = char;
      // move focus to next input if available
      if (inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }
  });
};

const onSubmitHandler = async (e) => {
  e.preventDefault()
  try {
    
    const otpArray = inputRefs.current.map(e => e.value)
    const otp = otpArray.join('')

    const { data } = await axios.post(
      `${backend_url}/api/auth/verify-account`, 
      {otp}, 
      { withCredentials: true }
    )

    if (data.success) {
      toast.success(data.message)
      getUserData()
      navigate('/')
    } else {
      toast.error(data.message)
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message)
  }
}

useEffect(() => {
  isLoggedIn && userData && userData.isAccountVerified && navigate('/')
}, [isLoggedIn,userData])


  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-400 to-purple-400'>
      <img
              onClick={() => navigate('/')}
              src={assets.logo}
              alt='logo'
              className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
            />
            <form onSubmit={onSubmitHandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm text-white'>
             <h1 className='text-center text-2xl mb-4'>Email Verify OTP</h1>
             <p className='text-gray-200 text-center mb-6'>Enter the 6-digit code sent to your email id</p>
             <div className='flex justify-between mb-8' onPaste={handlePaste}>
              {Array(6).fill(0).map((_,index)=>(
                <input ref={e=> inputRefs.current[index] = e} 
                onInput={(e)=> handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e,index)}
                type="text" maxLength="1" key={index} required className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'/>
              ))}
             </div>
             <button className='w-full py-3 bg-gradient-to-r from-indigo-500
             to-indigo-900 text-white rounded-full cursor-pointer
             '>Verify email</button>
            </form>
    </div>
  )
}

export default EmailVerify